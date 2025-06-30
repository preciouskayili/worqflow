import { z } from "zod";
import { tool, RunContext } from "@openai/agents";
import { getFigmaClient } from "../lib/misc";
import { TIntegrations } from "../../types/integrations";

// List team projects
export const listFigmaProjects = tool({
  name: "list_figma_projects",
  description: "List Figma projects for a team",
  parameters: z.object({ teamId: z.string() }),
  async execute({ teamId }, runContext?: RunContext<TIntegrations>) {
    const token = runContext?.context?.["figma"].access_token!;
    const figma = await getFigmaClient(token);
    const res = await figma.get(`/teams/${teamId}/projects`);
    return res.data;
  },
});

// List files in a project
export const listFigmaFiles = tool({
  name: "list_figma_files",
  description: "List Figma files in a project",
  parameters: z.object({ projectId: z.string() }),
  async execute({ projectId }, runContext?: RunContext<TIntegrations>) {
    const token = runContext?.context?.["figma"].access_token!;
    const figma = await getFigmaClient(token);
    const res = await figma.get(`/projects/${projectId}/files`);
    return res.data;
  },
});

// Get file details (including pages and nodes overview)
export const getFigmaFile = tool({
  name: "get_figma_file",
  description: "Get details of a Figma file",
  parameters: z.object({ fileId: z.string() }),
  async execute({ fileId }, runContext?: RunContext<TIntegrations>) {
    const token = runContext?.context?.["figma"].access_token!;
    const figma = await getFigmaClient(token);
    const res = await figma.get(`/files/${fileId}`);
    return res.data;
  },
});

// Get specific nodes from a file
export const getFigmaFileNodes = tool({
  name: "get_figma_file_nodes",
  description: "Get specific nodes from a Figma file",
  parameters: z.object({ fileId: z.string(), nodeIds: z.array(z.string()) }),
  async execute({ fileId, nodeIds }, runContext?: RunContext<TIntegrations>) {
    const token = runContext?.context?.["figma"].access_token!;
    const figma = await getFigmaClient(token);
    const params = nodeIds.map((id) => `ids=${id}`).join("&");
    const res = await figma.get(`/files/${fileId}/nodes?${params}`);
    return res.data;
  },
});

// List components in a file
export const getFigmaFileComponents = tool({
  name: "get_figma_file_components",
  description: "List components defined in a Figma file",
  parameters: z.object({ fileId: z.string() }),
  async execute({ fileId }, runContext?: RunContext<TIntegrations>) {
    const token = runContext?.context?.["figma"].access_token!;
    const figma = await getFigmaClient(token);
    const res = await figma.get(`/files/${fileId}/components`);
    return res.data;
  },
});

// Export images for nodes (returns URLs)
export const exportFigmaImages = tool({
  name: "export_figma_images",
  description: "Get image URLs for specific nodes in a file",
  parameters: z.object({
    fileId: z.string(),
    nodeIds: z.array(z.string()),
    scale: z.number().optional().nullable(),
  }),
  async execute(
    { fileId, nodeIds, scale },
    runContext?: RunContext<TIntegrations>
  ) {
    const token = runContext?.context?.["figma"].access_token!;
    const figma = await getFigmaClient(token);
    const params = new URLSearchParams();
    params.set("ids", nodeIds.join(","));
    if (scale) params.set("scale", scale.toString());
    const res = await figma.get(`/images/${fileId}?${params.toString()}`);
    return res.data;
  },
});

// Comments on a file
export const getFigmaFileComments = tool({
  name: "get_figma_file_comments",
  description: "List comments on a Figma file",
  parameters: z.object({ fileId: z.string() }),
  async execute({ fileId }, runContext?: RunContext<TIntegrations>) {
    const token = runContext?.context?.["figma"].access_token!;
    const figma = await getFigmaClient(token);
    const res = await figma.get(`/files/${fileId}/comments`);
    return res.data;
  },
});

// Notifications
export const listFigmaNotifications = tool({
  name: "list_figma_notifications",
  description: "List Figma notifications for the user",
  parameters: z.object({}),
  async execute(_, runContext?: RunContext<TIntegrations>) {
    const token = runContext?.context?.["figma"].access_token!;
    const figma = await getFigmaClient(token);
    const res = await figma.get(`/user/notifications`);
    return res.data;
  },
});

// Team members
export const listFigmaTeamMembers = tool({
  name: "list_figma_team_members",
  description: "List members of a Figma team",
  parameters: z.object({ teamId: z.string() }),
  async execute({ teamId }, runContext?: RunContext<TIntegrations>) {
    const token = runContext?.context?.["figma"].access_token!;
    const figma = await getFigmaClient(token);
    const res = await figma.get(`/teams/${teamId}/members`);
    return res.data;
  },
});

// Invite team member
export const inviteFigmaTeamMember = tool({
  name: "invite_figma_team_member",
  description: "Invite a new member to a Figma team",
  parameters: z.object({
    teamId: z.string(),
    email: z.string(),
    role: z.enum(["viewer", "editor", "owner"]),
  }),
  async execute(
    { teamId, email, role },
    runContext?: RunContext<TIntegrations>
  ) {
    const token = runContext?.context?.["figma"].access_token!;
    const figma = await getFigmaClient(token);
    const res = await figma.post(`/teams/${teamId}/members`, { email, role });
    return res.data;
  },
});

// Create file
export const createFigmaFile = tool({
  name: "create_figma_file",
  description: "Create a new Figma file",
  parameters: z.object({ projectId: z.string(), name: z.string() }),
  async execute({ projectId, name }, runContext?: RunContext<TIntegrations>) {
    const token = runContext?.context?.["figma"].access_token!;
    const figma = await getFigmaClient(token);
    const res = await figma.post(`/projects/${projectId}/files`, { name });
    return res.data;
  },
});

// Delete file
export const deleteFigmaFile = tool({
  name: "delete_figma_file",
  description: "Delete a Figma file",
  parameters: z.object({ fileId: z.string() }),
  async execute({ fileId }, runContext?: RunContext<TIntegrations>) {
    const token = runContext?.context?.["figma"].access_token!;
    const figma = await getFigmaClient(token);
    const res = await figma.delete(`/files/${fileId}`);
    return res.data;
  },
});

// Update file
export const updateFigmaFile = tool({
  name: "update_figma_file",
  description: "Update a Figma file",
  parameters: z.object({ fileId: z.string(), name: z.string() }),
  async execute({ fileId, name }, runContext?: RunContext<TIntegrations>) {
    const token = runContext?.context?.["figma"].access_token!;
    const figma = await getFigmaClient(token);
    const res = await figma.put(`/files/${fileId}`, { name });
    return res.data;
  },
});

// Search files
export const searchFigmaFiles = tool({
  name: "search_figma_files",
  description: "Search for Figma files",
  parameters: z.object({ query: z.string() }),
  async execute({ query }, runContext?: RunContext<TIntegrations>) {
    const token = runContext?.context?.["figma"].access_token!;
    const figma = await getFigmaClient(token);
    const res = await figma.get(`/search?query=${query}`);
    return res.data;
  },
});
