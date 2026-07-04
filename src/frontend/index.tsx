import React, { useState, useEffect } from 'react';
import ForgeReconciler, {
  Box,
  Heading,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Stack,
  Inline,
  xcss,
  useProductContext
} from '@forge/react';
import { DashboardIPA } from './components/DashboardIPA';
import { CatalogManager } from './components/CatalogManager';
import { AuditHistory } from './components/AuditHistory';

const headerStyles = xcss({
  backgroundColor: 'color.background.discovery',
  padding: 'space.200',
  borderRadius: 'border.radius',
  marginBottom: 'space.300',
  boxShadow: 'elevation.shadow.raised'
});

const subtitleStyles = xcss({
  color: 'color.text.subtlest'
});

export function App() {
  const context = useProductContext();
  const [boardId, setBoardId] = useState<string>('global');
  const [refreshHistoryTrigger, setRefreshHistoryTrigger] = useState(0);

  useEffect(() => {
    if (context?.extension?.project?.id) {
      setBoardId(`project-${context.extension.project.id}`);
    } else if (context?.extension?.project?.key) {
      setBoardId(`project-${context.extension.project.key}`);
    }
  }, [context]);

  return (
    <Box>
      {/* ── HEADER PREMIUM NATIVO ── */}
      <Box xcss={headerStyles}>
        <Stack space="space.100">
          <Inline space="space.100" alignBlock="center">
            <Heading as="h1">IPA Audit Manager</Heading>
          </Inline>
          <Text xcss={subtitleStyles}>
            ISO/IEC 25010 · Índice de Prioridad de Auditoría
          </Text>
        </Stack>
      </Box>

      {/* ── NAVEGACIÓN TABS NATIVAS ── */}
      <Tabs id="main-tabs">
        <TabList>
          <Tab>Dashboard IPA</Tab>
          <Tab>Gestión de Catálogos</Tab>
          <Tab>Histórico de Auditorías</Tab>
        </TabList>

        <TabPanel>
          <DashboardIPA boardId={boardId} onCalculate={() => setRefreshHistoryTrigger(prev => prev + 1)} />
        </TabPanel>

        <TabPanel>
          <CatalogManager />
        </TabPanel>

        <TabPanel>
          <AuditHistory boardId={boardId} refreshTrigger={refreshHistoryTrigger} />
        </TabPanel>
      </Tabs>
    </Box>
  );
}

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
