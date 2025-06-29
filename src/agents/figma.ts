import { Agent } from "@openai/agents";
import { FIGMA_AGENT_PROMPT } from "../lib/prompts";
import * as figmaTools from "../tools/figma";

const {
  exportFigmaImages,
  getFigmaFile,
  getFigmaFileComments,
  getFigmaFileComponents,
  getFigmaFileNodes,
  inviteFigmaTeamMember,
  listFigmaFiles,
  listFigmaNotifications,
  listFigmaProjects,
  listFigmaTeamMembers,
  searchFigmaFiles,
  updateFigmaFile,
  createFigmaFile,
  deleteFigmaFile,
} = figmaTools;

export const figmaAgent = new Agent({
  name: "figma_agent",
  instructions: FIGMA_AGENT_PROMPT,
  tools: [
    exportFigmaImages,
    getFigmaFile,
    getFigmaFileComments,
    getFigmaFileComponents,
    getFigmaFileNodes,
    inviteFigmaTeamMember,
    listFigmaFiles,
    listFigmaNotifications,
    listFigmaProjects,
    listFigmaTeamMembers,
    searchFigmaFiles,
    updateFigmaFile,
    createFigmaFile,
    deleteFigmaFile,
  ],
});
