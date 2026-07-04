// Script local para calcular IPA sobre un catálogo de ejemplo
const ISO_WEIGHTS = {
  Seguridad: 1.0,
  Fiabilidad: 0.8,
  Mantenibilidad: 0.7,
  Rendimiento: 0.6,
};

const FORMULA_WEIGHTS = {
  w1: 0.4,
  w2: 0.25,
  w3: 0.15,
  w4: 0.1,
  w5: 0.1,
};

function calculateAndRankRequirements(requirements, currentSprint) {
  const scored = requirements.map((req) => {
    const unnormalizedScore =
      FORMULA_WEIGHTS.w1 *
        req.importance *
        (ISO_WEIGHTS[req.isoCharacteristic] || 0.6) +
      FORMULA_WEIGHTS.w2 * Math.log10((req.children || []).length + 1) * 100 +
      FORMULA_WEIGHTS.w3 * (req.depth || 0) * 10 +
      FORMULA_WEIGHTS.w4 * (req.dependencies || []).length * 5 +
      FORMULA_WEIGHTS.w5 *
        (req.lastAuditDate === null
          ? currentSprint
          : Math.max(
              0,
              currentSprint -
                parseInt(String(req.lastAuditDate).split("-")[0] || 0),
            )) *
        10;
    return { ...req, unnormalizedScore };
  });

  const maxScore = Math.max(...scored.map((r) => r.unnormalizedScore), 1);

  return scored
    .map((r) => ({
      key: r.key,
      title: r.title,
      isoCharacteristic: r.isoCharacteristic,
      ipaScore: Math.round((r.unnormalizedScore / maxScore) * 100),
      importance: r.importance,
      children: (r.children || []).length,
      depth: r.depth || 0,
      dependencies: (r.dependencies || []).length,
      antiquity:
        r.lastAuditDate === null
          ? currentSprint
          : Math.max(
              0,
              currentSprint -
                parseInt(String(r.lastAuditDate).split("-")[0] || 0),
            ),
    }))
    .sort((a, b) => b.ipaScore - a.ipaScore);
}

// Catálogo de prueba (ejemplo de CATALOGS_EXAMPLES.md)
const sampleCatalog = [
  {
    key: "SEC-001",
    title: "Cifrado TLS 1.3",
    isoCharacteristic: "Seguridad",
    importance: 90,
    children: [],
    dependencies: [],
    depth: 1,
    lastAuditDate: null,
  },
  {
    key: "SEC-002",
    title: "Autenticación OAuth 2.0",
    isoCharacteristic: "Seguridad",
    importance: 70,
    children: [],
    dependencies: [],
    depth: 1,
    lastAuditDate: null,
  },
  {
    key: "PERF-001",
    title: "Tiempo respuesta <200ms",
    isoCharacteristic: "Rendimiento",
    importance: 90,
    children: [],
    dependencies: [],
    depth: 1,
    lastAuditDate: null,
  },
];

const currentSprint = 10;

const ranking = calculateAndRankRequirements(sampleCatalog, currentSprint);

console.log("Ranking IPA (muestra):");
ranking.forEach((r, i) => {
  console.log(
    `${i + 1}. ${r.key} — ${r.title} — ISO: ${r.isoCharacteristic} — IPA=${r.ipaScore} — Importance=${r.importance}`,
  );
});

module.exports = { calculateAndRankRequirements };
