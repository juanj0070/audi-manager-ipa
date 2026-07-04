import Resolver from "@forge/resolver";
import { kvs, WhereConditions } from "@forge/kvs";
import { jiraService } from "./jiraService";

const resolver = new Resolver();

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

interface Requirement {
  key: string;
  title: string;
  description: string;
  isoCharacteristic:
    | "Seguridad"
    | "Fiabilidad"
    | "Mantenibilidad"
    | "Rendimiento";
  importance: number; // 1-100
  children: string[];
  dependencies: string[];
  depth: number;
  linkedIssues: string[];
  lastAuditDate: string | null;
  auditCount: number;
}

interface Catalog {
  key: string;
  title: string;
  requirements: { [key: string]: Requirement };
}

interface IpaResult {
  sprintId: number;
  sprintName: string;
  calculatedAt: string;
  ranking: {
    key: string;
    title: string;
    isoCharacteristic: string;
    ipaScore: number;
    importance: number;
    children: number;
    depth: number;
    dependencies: number;
    antiquity: number;
  }[];
}

// ============================================================================
// CONFIGURACIÓN ISO 25010
// ============================================================================

// Pesos de las características ISO según criticidad normativa
const ISO_WEIGHTS: Record<string, number> = {
  Seguridad: 1.0, // Máxima criticidad: consecuencias legales (ENS, RGPD)
  Fiabilidad: 0.8, // Alta criticidad: impacto en continuidad de servicio
  Mantenibilidad: 0.7, // Criticidad media-alta: afecta deuda técnica
  Rendimiento: 0.6, // Criticidad media: medible con herramientas externas
};

// Pesos de la fórmula IPA (deben sumar 1.0)
const FORMULA_WEIGHTS = {
  w1: 0.4, // Importancia × Peso ISO (factor dominante)
  w2: 0.25, // Hijos (escala logarítmica) - nodos críticos
  w3: 0.15, // Profundidad - especificidad técnica
  w4: 0.1, // Dependencias - propagación de fallos
  w5: 0.1, // Antigüedad - requisitos desactualizados
};

// ============================================================================
// ALGORITMO IPA - APORTACIÓN PRINCIPAL DEL TFM
// ============================================================================

/**
 * Calcula el Índice de Prioridad de Auditoría (IPA)
 *
 * FÓRMULA:
 * IPA = (w1·I·W_ISO + w2·log(H+1)·100 + w3·P·10 + w4·D·5 + w5·A·10) / MAX × 100
 *
 * Variables:
 * - I: Importancia del requisito (1-100)
 * - W_ISO: Peso ISO 25010 (0.6-1.0)
 * - H: Número de requisitos hijos
 * - P: Profundidad en el árbol
 * - D: Número de dependencias
 * - A: Antigüedad de auditoría (Sprints transcurridos)
 *
 * APORTACIÓN TFM: Incorpora W_ISO como variable independiente,
 * diferenciando la priorización según la característica de calidad normativa
 */
function calculateIpaScore(
  requirement: Requirement,
  currentSprint: number,
  maxScore: number,
): number {
  // Obtener peso ISO del requisito
  const wIso = ISO_WEIGHTS[requirement.isoCharacteristic] || 0.6;

  // Calcular antigüedad (Sprints desde última auditoría)
  let antiquity: number;
  if (requirement.lastAuditDate === null) {
    antiquity = currentSprint; // Nunca auditado: máxima urgencia
  } else {
    const lastAuditSprint = parseInt(requirement.lastAuditDate.split("-")[0]);
    antiquity = Math.max(0, currentSprint - lastAuditSprint);
  }

  // Aplicar fórmula normalizada
  const unnormalizedScore =
    FORMULA_WEIGHTS.w1 * requirement.importance * wIso +
    FORMULA_WEIGHTS.w2 * Math.log10(requirement.children.length + 1) * 100 +
    FORMULA_WEIGHTS.w3 * requirement.depth * 10 +
    FORMULA_WEIGHTS.w4 * requirement.dependencies.length * 5 +
    FORMULA_WEIGHTS.w5 * antiquity * 10;

  // Normalizar al rango [0, 100]
  return (unnormalizedScore / maxScore) * 100;
}

/**
 * Calcula y ordena todos los requisitos por IPA
 */
function calculateAndRankRequirements(
  requirements: Requirement[],
  currentSprint: number,
  logicalSprintNumber: number,
): any[] {
  // Primer paso: calcular scores sin normalizar
  const scored = requirements.map((req) => {
    const wIso = ISO_WEIGHTS[req.isoCharacteristic] || 0.6;
    const multiplier = wIso >= 0.8 ? 2.0 : 1.0;

    const unnormalizedScore =
      FORMULA_WEIGHTS.w1 * req.importance * wIso * multiplier +
      FORMULA_WEIGHTS.w2 * Math.log10(req.children.length + 1) * 100 +
      FORMULA_WEIGHTS.w3 * req.depth * 10 +
      FORMULA_WEIGHTS.w4 * req.dependencies.length * 5 +
      FORMULA_WEIGHTS.w5 *
        (req.lastAuditDate === null
          ? logicalSprintNumber
          : logicalSprintNumber - parseInt(req.lastAuditDate.split("-")[0])) *
        10;
    return { ...req, unnormalizedScore };
  });

  // Segundo paso: encontrar MAX del conjunto evaluado
  const maxScore = Math.max(...scored.map((r) => r.unnormalizedScore), 1);

  // Tercer paso: normalizar y ordenar
  return scored
    .map((r) => ({
      key: r.key,
      title: r.title,
      isoCharacteristic: r.isoCharacteristic,
      ipaScore: Math.round((r.unnormalizedScore / maxScore) * 100),
      importance: r.importance,
      children: r.children.length,
      depth: r.depth,
      dependencies: r.dependencies.length,
      antiquity:
        r.lastAuditDate === null
          ? logicalSprintNumber
          : logicalSprintNumber - parseInt(r.lastAuditDate.split("-")[0]),
    }))
    .sort((a, b) => b.ipaScore - a.ipaScore);
}

// ============================================================================
// RESOLVERS (puntos de entrada del backend)
// ============================================================================

resolver.define("calculateIpa", async (req: any) => {
  try {
    const payload = req?.payload ?? req ?? {};
    const { catalogId, currentSprint, sprintName: passedSprintName } = payload;
    // Always use 'global' as the storage key so history is consistent
    const storageKey = "global";

    // Obtener catálogo desde KVS
    const catalog = await kvs.get<Catalog>(catalogId);
    if (!catalog) {
      return { error: "CATALOG_NOT_FOUND" };
    }

    // Convertir requisitos a array
    const requirementsList = Object.values(catalog.requirements || {});

    // Usar el nombre real del sprint pasado desde el frontend
    const displaySprintName = passedSprintName || `Sprint ${currentSprint}`;
    
    // Extraer número lógico de sprint para el cálculo de antigüedad (por defecto 1 si falla)
    const sprintNumberMatch = displaySprintName.match(/sprint\s*(\d+)/i);
    const logicalSprintNumber = sprintNumberMatch ? parseInt(sprintNumberMatch[1]) : 1;

    // Calcular y ordenar IPA
    const ranking = calculateAndRankRequirements(
      requirementsList,
      currentSprint,
      logicalSprintNumber
    );

    // Guardar resultado en histórico usando el ID de Jira como clave
    const result: IpaResult = {
      sprintId: currentSprint,
      sprintName: displaySprintName,
      calculatedAt: new Date().toISOString(),
      ranking,
    };

    await kvs.set(`ipa-result-${storageKey}-${currentSprint}`, result);

    return { ranking, totalRequirements: requirementsList.length };
  } catch (error) {
    console.error("Error calculating IPA:", error);
    return { error: "CALCULATION_ERROR", details: error };
  }
});

resolver.define("getCatalogs", async () => {
  try {
    const { results } = await kvs
      .query()
      .where("key", WhereConditions.beginsWith("catalog-"))
      .getMany();

    const catalogs = results.map((result) => {
      const catalogData = result.value as Catalog | undefined;
      return {
        id: result.key,
        title: catalogData?.title || "Unknown",
        requirementsCount: Object.keys(catalogData?.requirements || {}).length,
      };
    }).sort((a, b) => b.id.localeCompare(a.id));

    return { catalogs };
  } catch (error) {
    console.error("Error getting catalogs:", error);
    return { error: "ERROR_LOADING_CATALOGS" };
  }
});

resolver.define("saveCatalog", async (req: any) => {
  try {
    const payload = req?.payload ?? req ?? {};
    const { catalog } = payload;

    if (!catalog || !catalog.title || !catalog.requirements) {
      return { error: "INVALID_CATALOG_PAYLOAD" };
    }

    const catalogKey = `catalog-${Date.now()}`;

    await kvs.set(catalogKey, catalog);

    return { catalogKey, message: "Catalog saved successfully" };
  } catch (error) {
    console.error("Error saving catalog:", error);
    return { error: "ERROR_SAVING_CATALOG" };
  }
});

resolver.define("getIpaHistory", async (req: any) => {
  try {
    // Always use 'global' key for consistency
    const { results } = await kvs
      .query()
      .where("key", WhereConditions.beginsWith(`ipa-result-global-`))
      .getMany();

    return {
      history: results
        .map((result) => result.value as IpaResult | undefined)
        .filter((value): value is IpaResult => value !== undefined)
        .sort(
          (a, b) =>
            new Date(b.calculatedAt).getTime() -
            new Date(a.calculatedAt).getTime(),
        ),
    };
  } catch (error) {
    console.error("Error getting IPA history:", error);
    return { error: "ERROR_LOADING_HISTORY" };
  }
});

resolver.define("getActiveSprint", async (req: any) => {
  try {
    const payload = req?.payload ?? req ?? {};
    const { boardId } = payload;
    return await jiraService.getActiveSprint(boardId || "1");
  } catch (error) {
    console.error("Error getting active sprint:", error);
    return { error: "ERROR_GETTING_SPRINT" };
  }
});

resolver.define("clearHistory", async () => {
  try {
    // 1. Intentar borrar con la misma query que getIpaHistory
    const { results } = await kvs
      .query()
      .where("key", WhereConditions.beginsWith("ipa-result-global-"))
      .getMany();
        
    for (const result of results) {
      await kvs.delete(result.key);
    }
    
    // 2. Fuerza bruta: borrar del 1 al 50 por si la query de Forge falla
    for (let i = 1; i <= 50; i++) {
      await kvs.delete(`ipa-result-global-${i}`);
      await kvs.delete(`ipa-result-1-${i}`);
    }

    return { success: true, deleted: results.length };
  } catch (error) {
    console.error("Error clearing history:", error);
    return { error: "ERROR_CLEARING_HISTORY" };
  }
});

export const handler = resolver.getDefinitions();
