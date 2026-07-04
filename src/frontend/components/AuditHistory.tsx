import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import {
  Box,
  Heading,
  Text,
  Button,
  ButtonGroup,
  DynamicTable,
  Lozenge,
  ProgressBar,
  SectionMessage,
  Stack,
  Inline,
  xcss
} from '@forge/react';

interface IpaResult {
  sprintId: number;
  sprintName: string;
  calculatedAt: string;
  ranking: any[];
}

const cardStyles = xcss({
  backgroundColor: 'elevation.surface.raised',
  padding: 'space.200',
  borderRadius: 'border.radius',
  boxShadow: 'elevation.shadow.raised',
  marginBottom: 'space.300'
});

const statsGridStyles = xcss({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 'space.200'
});

const statCardStyles = xcss({
  backgroundColor: 'elevation.surface.raised',
  padding: 'space.200',
  borderRadius: 'border.radius',
  boxShadow: 'elevation.shadow.raised',
  flexGrow: 1,
  margin: 'space.100'
});

const statLabelStyles = xcss({
  color: 'color.text.subtlest',
  fontWeight: 'bold',
});

const getIpaLozengeAppearance = (score: number): "removed" | "warning" | "moved" | "success" => {
  if (score >= 80) return "removed";  // Rojo
  if (score >= 60) return "warning";  // Naranja
  if (score >= 40) return "moved";    // Amarillo/Ámbar
  return "success";                   // Verde
};

const getIsoLozengeAppearance = (iso: string): "new" | "success" | "discovery" | "warning" | "default" => {
  if (iso === 'Seguridad') return "new";
  if (iso === 'Fiabilidad') return "success";
  if (iso === 'Mantenibilidad') return "discovery";
  if (iso === 'Rendimiento') return "warning";
  return "default";
};

export function AuditHistory({ boardId, refreshTrigger }: { boardId: string, refreshTrigger?: number }) {
  const [history, setHistory] = useState<IpaResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<number | null>(null);

  useEffect(() => { loadHistory(); }, [boardId, refreshTrigger]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const result = (await invoke('getIpaHistory', { boardId })) as { history: IpaResult[] };
      if (result.history) {
        setHistory(result.history);
        if (result.history.length > 0) setSelectedSprint(result.history[0].sprintId);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedResult = history.find(h => h.sprintId === selectedSprint);
  const avgIpa = selectedResult
    ? Math.round(selectedResult.ranking.reduce((sum, r) => sum + r.ipaScore, 0) / selectedResult.ranking.length)
    : 0;
  const maxIpa = selectedResult ? Math.max(...selectedResult.ranking.map(r => r.ipaScore)) : 0;
  const minIpa = selectedResult ? Math.min(...selectedResult.ranking.map(r => r.ipaScore)) : 0;
  const criticalCount = selectedResult ? selectedResult.ranking.filter(r => r.ipaScore >= 80).length : 0;

  if (loading) {
    return <Text>Cargando histórico de auditorías...</Text>;
  }

  const emptyStateStyles = xcss({
    backgroundColor: 'color.background.discovery', borderWidth: 'border.width', borderStyle: 'solid', borderColor: 'color.border.discovery',
    padding: 'space.300',
    borderRadius: 'border.radius',
    marginBottom: 'space.300',
  });

  if (history.length === 0) {
    return (
      <Box xcss={emptyStateStyles}>
        <Heading as="h4">Sin historial de auditorías</Heading>
        <Text>Ve al Dashboard IPA y ejecuta «Calcular IPA» para generar el primer registro y poder compararlo.</Text>
      </Box>
    );
  }

  const tableHead = {
    cells: [
      { key: 'rank', content: '#' },
      { key: 'req', content: 'Requisito' },
      { key: 'iso', content: 'Categoría ISO' },
      { key: 'score', content: 'Score IPA' },
      { key: 'imp', content: 'Importancia' },
      { key: 'ant', content: 'Antigüedad' }
    ]
  };

  const tableRows = selectedResult?.ranking.map((req: any, index: number) => ({
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
      { key: 'ant', content: <Text>{req.antiquity === 0 ? '—' : `${req.antiquity} sprints`}</Text> }
    ]
  })) || [];

  const handleClearHistory = async () => {
    setLoading(true);
    await invoke('clearHistory');
    setHistory([]);
    setSelectedSprint(null);
    setLoading(false);
  };

  return (
    <Box>
      <Box xcss={cardStyles}>
        <Stack space="space.200">
          <Inline spread="space-between" alignBlock="center">
            <Heading as="h3">Timeline de Auditorías</Heading>
            <Button onClick={handleClearHistory}>Reiniciar Histórico</Button>
          </Inline>
          <ButtonGroup>
            {[...history].sort((a, b) => a.sprintId - b.sprintId).map((result) => {
              return (
                <Button
                  key={`${result.sprintId}-${result.calculatedAt}`}
                  isSelected={selectedSprint === result.sprintId}
                  onClick={() => setSelectedSprint(result.sprintId)}
                >
                  {result.sprintName}
                </Button>
              );
            })}
          </ButtonGroup>
        </Stack>
      </Box>

      {selectedResult && (
        <Box>
          <Box xcss={statsGridStyles}>
            <Box xcss={statCardStyles}>
              <Text xcss={statLabelStyles}>Promedio IPA</Text>
              <Heading as="h1">{avgIpa}</Heading>
            </Box>
            <Box xcss={statCardStyles}>
              <Text xcss={statLabelStyles}>IPA Máximo</Text>
              <Heading as="h1">{maxIpa}</Heading>
            </Box>
            <Box xcss={statCardStyles}>
              <Text xcss={statLabelStyles}>IPA Mínimo</Text>
              <Heading as="h1">{minIpa}</Heading>
            </Box>
            <Box xcss={statCardStyles}>
              <Text xcss={statLabelStyles}>Críticos</Text>
              <Heading as="h1">{criticalCount}</Heading>
            </Box>
          </Box>

          <Box xcss={cardStyles}>
            <Heading as="h3">Resultados de {selectedResult.sprintName}</Heading>
            <DynamicTable
              head={tableHead}
              rows={tableRows}
              rowsPerPage={10}
              defaultPage={1}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
