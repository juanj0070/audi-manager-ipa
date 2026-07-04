import api, { route } from "@forge/api";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes TTL

export const jiraService = {
  getActiveSprint: async (boardId: string) => {
    const cacheKey = `sprint-${boardId}`;
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }
    }

    try {
      let targetBoardId = boardId;
      
      // Si recibimos un ID de proyecto, buscamos su tablero
      if (boardId.startsWith('project-')) {
        const projectId = boardId.replace('project-', '');
        const boardsResponse = await api.asApp().requestJira(route`/rest/agile/1.0/board?projectKeyOrId=${projectId}`);
        if (boardsResponse.ok) {
          const boardsData = await boardsResponse.json();
          if (boardsData.values && boardsData.values.length > 0) {
            targetBoardId = boardsData.values[0].id.toString();
          }
        }
      } else if (boardId === 'global') {
        const boardsResponse = await api.asApp().requestJira(route`/rest/agile/1.0/board`);
        if (boardsResponse.ok) {
          const boardsData = await boardsResponse.json();
          if (boardsData.values && boardsData.values.length > 0) {
            targetBoardId = boardsData.values[0].id.toString();
          }
        }
      }

      if (targetBoardId !== 'global' && !targetBoardId.startsWith('project-')) {
        const response = await api.asApp().requestJira(route`/rest/agile/1.0/board/${targetBoardId}/sprint?state=active,future`);
        if (response.ok) {
          const data = await response.json();
          // Priorizar explícitamente el activo
          const activeSprint = data.values ? data.values.find((s: any) => s.state === 'active') : null;
          const sprint = activeSprint || (data.values && data.values.length > 0 ? data.values[0] : null);
          
          if (sprint) {
             const sprintData = { id: sprint.id, name: sprint.name, state: sprint.state };
             cache.set(cacheKey, { data: sprintData, timestamp: Date.now() });
             return sprintData;
          }
        }
      }
    } catch (e) {
      console.warn("Error fetching active sprint from Jira API:", e);
    }
    
    // Fallback de emergencia por si el usuario no tiene ningún proyecto Scrum creado
    const fallbackSprint = { id: 1, name: "Sprint 1", state: "active" };
    cache.set(cacheKey, { data: fallbackSprint, timestamp: Date.now() });
    return fallbackSprint;
  },

  getProjectMetadata: async (projectKey: string) => {
    try {
      const response = await api.asApp().requestJira(route`/rest/api/3/project/${projectKey}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn("Error fetching project metadata", e);
    }
    return null;
  }
};
