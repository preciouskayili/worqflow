import { getDocsService, getDriveService } from "../../lib/googleapis";

export const listDocs = async (googleIntegration: {
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
}) => {
  const drive = await getDriveService(googleIntegration);
  const res = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.document'",
    fields: "files(id,name)",
  });
  return res.data;
};

export const searchDocs = async (
  query: string,
  googleIntegration: {
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
  }
) => {
  const drive = await getDriveService(googleIntegration);
  const res = await drive.files.list({
    q: `name contains '${query}' and mimeType='application/vnd.google-apps.document'`,
    fields: "files(id,name)",
  });
  return res.data;
};

export const createDoc = async (
  title: string,
  googleIntegration: {
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
  }
) => {
  const docs = await getDocsService(googleIntegration);
  const res = await docs.documents.create({
    requestBody: { title: title },
  });
  return res.data;
};

export const deleteDoc = async (
  fileId: string,
  googleIntegration: {
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
  }
) => {
  const drive = await getDriveService(googleIntegration);
  await drive.files.delete({ fileId: fileId });
  return { success: true };
};

export const insertText = async (
  fileId: string,
  text: string,
  googleIntegration: {
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
  }
) => {
  const docs = await getDocsService(googleIntegration);
  const res = await docs.documents.batchUpdate({
    documentId: fileId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: text,
          },
        },
      ],
    },
  });
  return res.data;
};

export const replaceText = async (
  fileId: string,
  searchText: string,
  replaceText: string,
  googleIntegration: {
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
  }
) => {
  const docs = await getDocsService(googleIntegration);
  const res = await docs.documents.batchUpdate({
    documentId: fileId,
    requestBody: {
      requests: [
        {
          replaceAllText: {
            containsText: { text: searchText, matchCase: false },
            replaceText: replaceText,
          },
        },
      ],
    },
  });
  return res.data;
};

export const shareDoc = async (
  fileId: string,
  email: string,
  role: "reader" | "writer" | "commenter",
  googleIntegration: {
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
  }
) => {
  const drive = await getDriveService(googleIntegration);
  const res = await drive.permissions.create({
    fileId: fileId,
    requestBody: {
      type: "user",
      role: role,
      emailAddress: email,
    },
    sendNotificationEmail: false,
  });
  return res.data;
};

export const listCollaborators = async (
  fileId: string,
  googleIntegration: {
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
  }
) => {
  const drive = await getDriveService(googleIntegration);
  const res = await drive.permissions.list({ fileId: fileId });
  return res.data;
};

export const getLastEdited = async (
  fileId: string,
  googleIntegration: {
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
  }
) => {
  const drive = await getDriveService(googleIntegration);
  const res = await drive.files.get({
    fileId: fileId,
    fields: "modifiedTime",
  });
  return res.data;
};

