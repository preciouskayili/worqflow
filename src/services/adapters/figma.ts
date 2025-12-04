import { getFigmaClient } from "../../lib/misc";

export const listFigmaProjects = async (
  teamId: string,
  access_token: string
) => {
  const figma = await getFigmaClient(access_token);
  const res = await figma.get(`/teams/${teamId}/projects`);
  return res.data;
};

export const listFigmaFiles = async (
  projectId: string,
  access_token: string
) => {
  const figma = await getFigmaClient(access_token);
  const res = await figma.get(`/projects/${projectId}/files`);
  return res.data;
};

export const getFigmaFile = async (fileId: string, access_token: string) => {
  const figma = await getFigmaClient(access_token);
  const res = await figma.get(`/files/${fileId}`);
  return res.data;
};

export const getFigmaFileNodes = async (
  fileId: string,
  nodeIds: string[],
  access_token: string
) => {
  const figma = await getFigmaClient(access_token);
  const params = nodeIds.map((id) => `ids=${id}`).join("&");
  const res = await figma.get(`/files/${fileId}/nodes?${params}`);
  return res.data;
};

export const getFigmaFileComponents = async (
  fileId: string,
  access_token: string
) => {
  const figma = await getFigmaClient(access_token);
  const res = await figma.get(`/files/${fileId}/components`);
  return res.data;
};

export const exportFigmaImages = async (
  fileId: string,
  nodeIds: string[],
  scale: number | null | undefined,
  access_token: string
) => {
  const figma = await getFigmaClient(access_token);
  const params = new URLSearchParams();
  params.set("ids", nodeIds.join(","));
  if (scale) params.set("scale", scale.toString());
  const res = await figma.get(`/images/${fileId}?${params.toString()}`);
  return res.data;
};

export const getFigmaFileComments = async (
  fileId: string,
  access_token: string
) => {
  const figma = await getFigmaClient(access_token);
  const res = await figma.get(`/files/${fileId}/comments`);
  return res.data;
};

export const listFigmaNotifications = async (access_token: string) => {
  const figma = await getFigmaClient(access_token);
  const res = await figma.get(`/user/notifications`);
  return res.data;
};

export const listFigmaTeamMembers = async (
  teamId: string,
  access_token: string
) => {
  const figma = await getFigmaClient(access_token);
  const res = await figma.get(`/teams/${teamId}/members`);
  return res.data;
};

export const inviteFigmaTeamMember = async (
  teamId: string,
  email: string,
  role: "viewer" | "editor" | "owner",
  access_token: string
) => {
  const figma = await getFigmaClient(access_token);
  const res = await figma.post(`/teams/${teamId}/members`, { email, role });
  return res.data;
};

export const createFigmaFile = async (
  projectId: string,
  name: string,
  access_token: string
) => {
  const figma = await getFigmaClient(access_token);
  const res = await figma.post(`/projects/${projectId}/files`, { name });
  return res.data;
};

export const deleteFigmaFile = async (fileId: string, access_token: string) => {
  const figma = await getFigmaClient(access_token);
  const res = await figma.delete(`/files/${fileId}`);
  return res.data;
};

export const updateFigmaFile = async (
  fileId: string,
  name: string,
  access_token: string
) => {
  const figma = await getFigmaClient(access_token);
  const res = await figma.put(`/files/${fileId}`, { name });
  return res.data;
};

export const searchFigmaFiles = async (
  query: string,
  access_token: string
) => {
  const figma = await getFigmaClient(access_token);
  const res = await figma.get(`/search?query=${query}`);
  return res.data;
};

