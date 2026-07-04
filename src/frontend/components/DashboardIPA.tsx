import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import {
  Box,
  Button,
  Heading,
  Text,
  DynamicTable,
  Lozenge,
  ProgressBar,
  SectionMessage,
  Stack,
  Inline,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  xcss
} from '@forge/react';

interface RankingEntry {
  key: string;
  title: string;
  isoCharacteristic: string;
  importance: number;
  ipaScore: number;
  children: number;
  depth: number;
  dependencies: number;
  antiquity: number;
}

const cardStyles = xcss({
  backgroundColor: 'elevation.surface.raised',
  padding: 'space.200',
  borderRadius: 'border.radius',
  boxShadow: 'elevation.shadow.raised',
  marginBottom: 'space.200'
});

const kpiGridStyles = xcss({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 'space.200'
});

const kpiCardStyles = xcss({
  backgroundColor: 'elevation.surface.raised',
  padding: 'space.200',
  borderRadius: 'border.radius',
  boxShadow: 'elevation.shadow.raised',
  flexGrow: 1,
  margin: 'space.100'
});

const kpiLabelStyles = xcss({
  color: 'color.text.subtlest',
  fontWeight: 'bold',
});

const infoBoxStyles = xcss({
  backgroundColor: 'color.background.discovery', borderWidth: 'border.width', borderStyle: 'solid', borderColor: 'color.border.discovery',
  padding: 'space.200',
  borderRadius: 'border.radius',
  marginTop: 'space.100'
});

const getIpaLozengeAppearance = (score: number): "removed" | "warning" | "moved" | "success" => {
  if (score >= 80) return "removed";
  if (score >= 60) return "warning";
  if (score >= 40) return "moved";
  return "success";
};

const getIsoLozengeAppearance = (iso: string): "new" | "success" | "discovery" | "warning" | "default" => {
  if (iso === 'Seguridad') return "new";
  if (iso === 'Fiabilidad') return "success";
  if (iso === 'Mantenibilidad') return "discovery";
  if (iso === 'Rendimiento') return "warning";
  return "default";
};

export function DashboardIPA({ boardId, onCalculate }: { boardId: string, onCalculate?: () => void }) {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [statusAppearance, setStatusAppearance] = useState<'information' | 'success' | 'error' | 'warning'>('information');
  const [catalogId, setCatalogId] = useState('');
  const [currentSprintId, setCurrentSprintId] = useState<number | string>(1);
  const [sprintName, setSprintName] = useState('Cargando sprint...');
  const [avgIpa, setAvgIpa] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [selectedReq, setSelectedReq] = useState<RankingEntry | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const sprintData = (await invoke('getActiveSprint', { boardId })) as { id?: number, name?: string };
        if (sprintData && sprintData.id) {
          setCurrentSprintId(sprintData.id);
          setSprintName(sprintData.name || `Sprint ${sprintData.id}`);
        } else {
          setSprintName('Sprint no detectado');
        }
      } catch (e) {
        setSprintName('Error al conectar con Jira API');
      }

      try {
        const result = (await invoke('getCatalogs', {})) as { catalogs?: Array<{ id: string; title: string }> };
        if (result.catalogs && result.catalogs.length > 0) {
          setCatalogId(result.catalogs[0].id);
          setStatus(`Catálogo activo: ${result.catalogs[0].title}`);
          setStatusAppearance('information');
        } else {
          setStatus('Sin catálogos. Ve a "Gestión de Catálogos" y crea uno para comenzar.');
          setStatusAppearance('warning');
        }
      } catch (error) {
        setStatus('No se pudo cargar el catálogo activo.');
        setStatusAppearance('error');
      }
    };
    loadData();
  }, [boardId]);

  const handleCalculateIpa = async () => {
    if (!catalogId) {
      setStatus('No hay catálogo activo. Crea un catálogo primero.');
      setStatusAppearance('error');
      return;
    }
    setLoading(true);
    setStatus('Calculando IPA...');
    setStatusAppearance('information');
    try {
      const result = (await invoke('calculateIpa', { boardId: 'global', catalogId, currentSprint: currentSprintId, sprintName })) as { ranking: RankingEntry[] };
      if (result.ranking && result.ranking.length > 0) {
        setRanking(result.ranking);
        
        // Notify parent that calculation was successful and history should be refreshed
        if (onCalculate) {
          onCalculate();
        }
        const avg = Math.round(result.ranking.reduce((sum, r) => sum + r.ipaScore, 0) / result.ranking.length);
        const critical = result.ranking.filter(r => r.ipaScore >= 80).length;
        setAvgIpa(avg);
        setCriticalCount(critical);
        setStatus(`Cálculo completado: ${result.ranking.length} requisitos evaluados en el sprint actual.`);
        setStatusAppearance('success');
      } else {
        setStatus('No se recibieron resultados del cálculo.');
        setStatusAppearance('error');
      }
    } catch (error) {
      setStatus('Error al calcular el IPA. Revisa la consola.');
      setStatusAppearance('error');
    } finally {
      setLoading(false);
    }
  };

  const tableHead = {
    cells: [
      { key: 'rank', content: '#' },
      { key: 'req', content: 'Requisito' },
      { key: 'iso', content: 'Categoría ISO' },
      { key: 'score', content: 'Score IPA' },
      { key: 'imp', content: 'Importancia' },
      { key: 'actions', content: 'Acciones' }
    ]
  };

  const tableRows = ranking.map((req, index) => ({
    key: req.key,
    cells: [
      { key: 'rank', content: <Text>{index + 1}</Text> },
      { key: 'req', content: <Stack><Text weight="bold">{req.key}</Text><Text>{req.title}</Text></Stack> },
      { key: 'iso', content: <Lozenge appearance={getIsoLozengeAppearance(req.isoCharacteristic)}>{req.isoCharacteristic}</Lozenge> },
      { key: 'score', content: (
        <Stack space="space.050">
          <Inline space="space.100" alignBlock="center">
            <Text weight="bold">{req.ipaScore}</Text>
            <Lozenge appearance={getIpaLozengeAppearance(req.ipaScore)}>
              {req.ipaScore >= 80 ? 'CRÍTICO' : req.ipaScore >= 60 ? 'ALTO' : req.ipaScore >= 40 ? 'MEDIO' : 'BAJO'}
            </Lozenge>
          </Inline>
          <ProgressBar value={req.ipaScore / 100} />
        </Stack>
      )},
      { key: 'imp', content: <Text>{req.importance}</Text> },
      { key: 'actions', content: <Button appearance="subtle" onClick={() => setSelectedReq(req)}>Ver Detalle</Button> }
    ]
  }));

  return (
    <Box>
      <Box xcss={cardStyles}>
        <Stack space="space.200">
          <Heading as="h3">Configuración del Cálculo</Heading>
          
          <Inline space="space.200" alignBlock="center">
            <Text weight="bold">Sprint activo (Jira API):</Text>
            <Lozenge appearance="inprogress">{sprintName}</Lozenge>
          </Inline>
          
          <Button 
            appearance="primary" 
            isLoading={loading} 
            onClick={handleCalculateIpa}
          >
            Calcular IPA
          </Button>

          {status && (
            <SectionMessage appearance={statusAppearance}>
              <Text>{status}</Text>
            </SectionMessage>
          )}
        </Stack>
      </Box>

      {ranking.length > 0 && (
        <Box xcss={kpiGridStyles}>
          <Box xcss={kpiCardStyles}>
            <Text xcss={kpiLabelStyles}>IPA Promedio</Text>
            <Heading as="h1">{avgIpa}</Heading>
          </Box>
          <Box xcss={kpiCardStyles}>
            <Text xcss={kpiLabelStyles}>Requisitos Críticos (≥80)</Text>
            <Heading as="h1">{criticalCount}</Heading>
          </Box>
          <Box xcss={kpiCardStyles}>
            <Text xcss={kpiLabelStyles}>Total Evaluados</Text>
            <Heading as="h1">{ranking.length}</Heading>
          </Box>
        </Box>
      )}

      {ranking.length > 0 && (
        <Box xcss={cardStyles}>
          <Heading as="h3">Ranking de Prioridad</Heading>
          <DynamicTable
            head={tableHead}
            rows={tableRows}
            rowsPerPage={10}
            defaultPage={1}
            loadingSpinnerSize="large"
            isLoading={loading}
          />
        </Box>
      )}

      {selectedReq && (
        <Modal onClose={() => setSelectedReq(null)}>
          <ModalHeader>
            <ModalTitle>Desglose de Prioridad IPA: {selectedReq.key}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <Stack space="space.200">
              <Text weight="bold">{selectedReq.title}</Text>
              
              <Box xcss={cardStyles}>
                <Heading as="h4">Variables del Algoritmo</Heading>
                <Stack space="space.100">
                  <Inline spread="space-between"><Text>Puntuación Final (IPA):</Text><Text weight="bold">{selectedReq.ipaScore} / 100</Text></Inline>
                  <Inline spread="space-between"><Text>Categoría ISO (W_ISO):</Text><Lozenge appearance={getIsoLozengeAppearance(selectedReq.isoCharacteristic)}>{selectedReq.isoCharacteristic}</Lozenge></Inline>
                  <Inline spread="space-between"><Text>Importancia Estratégica (I):</Text><Text>{selectedReq.importance}</Text></Inline>
                  <Inline spread="space-between"><Text>Subrequisitos Hijos (H):</Text><Text>{selectedReq.children}</Text></Inline>
                  <Inline spread="space-between"><Text>Profundidad (P):</Text><Text>{selectedReq.depth}</Text></Inline>
                  <Inline spread="space-between"><Text>Dependencias (D):</Text><Text>{selectedReq.dependencies}</Text></Inline>
                  <Inline spread="space-between"><Text>Antigüedad (A):</Text><Text>{selectedReq.antiquity === 0 ? 'Auditado este sprint' : `${selectedReq.antiquity} sprints sin auditar`}</Text></Inline>
                </Stack>
              </Box>

              <Box xcss={infoBoxStyles}>
                <Text color="color.text.subtlest">
                  El cálculo utiliza los pesos ISO/IEC 25010 y aplica un multiplicador de x2.0 si la categoría es crítica (Seguridad o Fiabilidad).
                </Text>
              </Box>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button appearance="subtle" onClick={() => setSelectedReq(null)}>Cerrar Panel</Button>
          </ModalFooter>
        </Modal>
      )}
    </Box>
  );
}
