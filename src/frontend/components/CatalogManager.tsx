import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import {
  Box,
  Button,
  ButtonGroup,
  Heading,
  Text,
  Stack,
  Inline,
  Lozenge,
  CodeBlock,
  TextArea,
  Label,
  xcss
} from '@forge/react';

interface Catalog {
  id: string;
  title: string;
  requirementsCount: number;
}

const CSV_TEMPLATES = {
  completo: `SEC-001;Cifrado TLS 1.3;Seguridad;90
SEC-002;Autenticación OAuth 2.0;Seguridad;70
SEC-003;Control de acceso RBAC;Seguridad;60
REL-001;Disponibilidad 99.9%;Fiabilidad;85
REL-002;Tolerancia a fallos;Fiabilidad;65
MAN-001;Cobertura de tests >80%;Mantenibilidad;80
MAN-002;Documentación de API;Mantenibilidad;50
PERF-001;Tiempo respuesta <200ms;Rendimiento;90
PERF-002;Carga máx. 10k usuarios;Rendimiento;75
PERF-003;Uso CPU <70%;Rendimiento;55`,
  simple: `SEC-001;Cifrado TLS;Seguridad;90
PERF-001;Tiempo resp. <200ms;Rendimiento;90`
};

const cardStyles = xcss({
  backgroundColor: 'elevation.surface.raised',
  padding: 'space.200',
  borderRadius: 'border.radius',
  boxShadow: 'elevation.shadow.raised',
  marginBottom: 'space.300'
});

const catalogItemStyles = xcss({
  padding: 'space.150',
  backgroundColor: 'color.background.neutral.subtle',
  borderRadius: 'border.radius',
  border: '1px solid',
  borderColor: 'color.border',
  marginBottom: 'space.100'
});

export function CatalogManager() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'information' | 'warning'>('information');
  const [showCsvInput, setShowCsvInput] = useState(false);
  const [activeMode, setActiveMode] = useState<'simple' | 'completo' | 'csv' | null>(null);
  const [customCsv, setCustomCsv] = useState('');

  useEffect(() => { loadCatalogs(); }, []);

  const loadCatalogs = async () => {
    setLoading(true);
    try {
      const result = (await invoke('getCatalogs', {})) as { catalogs: any[] };
      if (result.catalogs) setCatalogs(result.catalogs);
    } catch (error) {
      console.error('Error loading catalogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseCsvAndCreateCatalog = async (csv: string, title: string) => {
    try {
      setMessage('Procesando catálogo...');
      setMessageType('information');
      const lines = csv.trim().split('\n');
      const requirements: Record<string, any> = {};

      lines.forEach((line) => {
        const parts = line.split(';');
        if (parts.length >= 4) {
          const [key, reqTitle, iso, importance] = parts;
          requirements[key.trim()] = {
            key: key.trim(), title: reqTitle.trim(),
            isoCharacteristic: iso.trim(), importance: parseInt(importance),
            children: [], dependencies: [], depth: 1,
            linkedIssues: [], lastAuditDate: null, auditCount: 0,
          };
        }
      });

      if (Object.keys(requirements).length === 0) {
        setMessage('CSV inválido. Formato esperado: KEY;Título;Categoría ISO;Importancia(1-100)');
        setMessageType('error');
        return;
      }

      const catalog = {
        title,
        description: `Catálogo ISO/IEC 25010 con ${Object.keys(requirements).length} requisitos`,
        requirements,
      };

      const result = (await invoke('saveCatalog', { catalog })) as { catalogKey: string };
      if (result.catalogKey) {
        setMessage(`Catálogo "${title}" creado con ${Object.keys(requirements).length} requisitos`);
        setMessageType('success');
        setShowCsvInput(false);
        loadCatalogs();
      }
    } catch (error) {
      setMessage('Error al guardar el catálogo. Inténtalo de nuevo.');
      setMessageType('error');
    }
  };

  const handleCreateFromTemplate = async (template: keyof typeof CSV_TEMPLATES) => {
    setActiveMode(template);
    setShowCsvInput(false);
    const titles = { completo: 'Catálogo Completo ISO 25010', simple: 'Catálogo Demo Básico' };
    await parseCsvAndCreateCatalog(CSV_TEMPLATES[template], titles[template]);
  };

  return (
    <Box>
      <Box xcss={cardStyles}>
        <Stack space="space.200">
          <Heading as="h3">Crear Catálogo de Requisitos</Heading>
          <Text>Carga requisitos ISO/IEC 25010 para usarlos en el cálculo IPA.</Text>
          
          <ButtonGroup>
            <Button 
              isSelected={activeMode === 'simple'} 
              onClick={() => handleCreateFromTemplate('simple')}
            >
              Demo Rápido (2 req)
            </Button>
            <Button 
              isSelected={activeMode === 'completo'} 
              onClick={() => handleCreateFromTemplate('completo')}
            >
              Catálogo Completo (10 req)
            </Button>
            <Button 
              isSelected={activeMode === 'csv'} 
              onClick={() => {
                const newShow = !showCsvInput;
                setShowCsvInput(newShow);
                setActiveMode(newShow ? 'csv' : null);
              }}
            >
              CSV Personalizado
            </Button>
          </ButtonGroup>

          {showCsvInput && (
            <Stack space="space.200">
              <Box xcss={xcss({
                backgroundColor: 'color.background.discovery',
                padding: 'space.200',
                borderRadius: 'border.radius',
                marginBottom: 'space.100'
              })}>
                <Stack space="space.100">
                  <Heading as="h4">Formato CSV Requerido</Heading>
                  <Text>Debes importar tu CSV siguiendo el formato: KEY;Título;Categoría;Importancia</Text>
                  <CodeBlock language="text" text={CSV_TEMPLATES.completo} />
                </Stack>
              </Box>
              <Box>
                <Label labelFor="csv-input">Pega aquí el contenido de tu archivo CSV:</Label>
                <TextArea 
                  id="csv-input" 
                  name="csvInput"
                  value={customCsv} 
                  onChange={(e: any) => setCustomCsv(e.target.value)}
                  minimumRows={5} 
                />
              </Box>
              <Button 
                appearance="primary" 
                onClick={() => {
                  if (customCsv.trim() !== "") {
                    parseCsvAndCreateCatalog(customCsv, `Catálogo Personalizado ${new Date().toLocaleTimeString()}`);
                  } else {
                    setMessage('El área de texto está vacía.');
                    setMessageType('error');
                  }
                }}
              >
                Importar CSV
              </Button>
            </Stack>
          )}

          {message && (
            <Box xcss={xcss({
              backgroundColor: messageType === 'success' ? 'color.background.success' : messageType === 'error' ? 'color.background.danger' : 'color.background.information',
              padding: 'space.150',
              borderRadius: 'border.radius',
            })}>
              <Text>{message}</Text>
            </Box>
          )}
        </Stack>
      </Box>

      <Box xcss={cardStyles}>
        <Stack space="space.200">
          <Inline space="space.100" alignBlock="center">
            <Heading as="h3">Catálogos Disponibles</Heading>
            <Lozenge appearance="new">{catalogs.length} guardados</Lozenge>
          </Inline>
          
          {loading ? (
            <Text>Cargando catálogos...</Text>
          ) : catalogs.length === 0 ? (
            <Box xcss={xcss({
              backgroundColor: 'color.background.neutral',
              padding: 'space.150',
              borderRadius: 'border.radius',
            })}>
              <Text>No hay catálogos almacenados. Crea el primero desde el panel superior.</Text>
            </Box>
          ) : (
            <Stack space="space.100">
              {catalogs.map(catalog => (
                <Box key={catalog.id} xcss={catalogItemStyles}>
                  <Inline space="space.100" alignBlock="center" spread="space-between">
                    <Stack>
                      <Text weight="bold">{catalog.title}</Text>
                      <Text size="small" color="color.text.subtlest">ID: {catalog.id}</Text>
                    </Stack>
                    <Lozenge>{catalog.requirementsCount} requisitos</Lozenge>
                  </Inline>
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
      </Box>

      <Box xcss={cardStyles}>
        <Heading as="h4">Categorías ISO/IEC 25010 Soportadas</Heading>
        <Inline space="space.100">
          <Lozenge appearance="new">Seguridad</Lozenge>
          <Lozenge appearance="success">Fiabilidad</Lozenge>
          <Lozenge appearance="discovery">Mantenibilidad</Lozenge>
          <Lozenge appearance="warning">Rendimiento</Lozenge>
        </Inline>
      </Box>
    </Box>
  );
}
