import { AnyAaaaRecord } from "dns";
import { getGmailService } from "../../lib/googleapis";
import { encode } from "../../lib/misc";

type Integration = {
  access_token: string;
  refresh_token: string;
  expires_at?: any;
};

export const sendEmail = async (
  args: { to: string; subject: string; message: string },
  googleIntegration: Integration
) => {
  const service = await getGmailService(googleIntegration);

  const raw = Buffer.from(
    `To: ${args.to}\r\n` +
      `Subject: ${args.subject}\r\n\r\n` +
      `${args.message}`
  ).toString("base64url");

  const res = await service.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });

  return res.data;
};

export const listEmails = async (
  args: { query: string; maxResults: number },
  googleIntegration: Integration
) => {
  const service = await getGmailService(googleIntegration);

  const res = await service.users.messages.list({
    userId: "me",
    q: args.query,
    maxResults: args.maxResults,
  });

  const messages = res.data.messages || [];

  const detailedMessages = await Promise.all(
    messages.map(async (msg) => {
      const full = await service.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "metadata",
        metadataHeaders: ["Subject", "From"],
      });
      return {
        id: msg.id,
        snippet: full.data.snippet,
        headers: full.data.payload?.headers,
      };
    })
  );

  return detailedMessages;
};

export const readEmail = async (
  messageId: string,
  googleIntegration: Integration
) => {
  const service = await getGmailService(googleIntegration);

  const res = await service.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });
  return {
    id: res.data.id,
    snippet: res.data.snippet,
    payload: res.data.payload,
  };
};

export const createDraft = async (
  args: { to: string; subject: string; message: string },
  googleIntegration: Integration
) => {
  const service = await getGmailService(googleIntegration);

  const raw = Buffer.from(
    `To: ${args.to}\r\n` +
      `Subject: ${args.subject}\r\n\r\n` +
      `${args.message}`
  ).toString("base64url");

  const res = await service.users.drafts.create({
    userId: "me",
    requestBody: {
      message: {
        raw,
      },
    },
  });

  return res.data;
};

export const listLabels = async (googleIntegration: Integration) => {
  const service = await getGmailService(googleIntegration);

  const res = await service.users.labels.list({
    userId: "me",
  });

  return res.data.labels;
};

export const addLabelToEmail = async (
  messageId: string,
  labelId: string,
  googleIntegration: Integration
) => {
  const service = await getGmailService(googleIntegration);

  const res = await service.users.messages.modify({
    userId: "me",
    id: messageId,
    requestBody: {
      addLabelIds: [labelId],
    },
  });

  return res.data;
};

export const markAsRead = async (
  messageId: string,
  googleIntegration: Integration
) => {
  const service = await getGmailService(googleIntegration);
  const res = await service.users.messages.modify({
    userId: "me",
    id: messageId,
    requestBody: {
      removeLabelIds: ["UNREAD"],
    },
  });
  return res.data;
};

export const archiveEmail = async (
  messageId: string,
  googleIntegration: Integration
) => {
  const service = await getGmailService(googleIntegration);
  const res = await service.users.messages.modify({
    userId: "me",
    id: messageId,
    requestBody: {
      removeLabelIds: ["INBOX"],
    },
  });
  return res.data;
};

export const searchEmails = async (
  args: { query: string; maxResults: number },
  googleIntegration: Integration
) => {
  const service = await getGmailService(googleIntegration);

  const res = await service.users.messages.list({
    userId: "me",
    q: args.query,
    maxResults: args.maxResults,
  });

  const messages = res.data.messages || [];

  const detailed = await Promise.all(
    messages.map(async (msg) => {
      const full = await service.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "metadata",
        metadataHeaders: ["Subject", "From"],
      });
      return {
        id: msg.id,
        snippet: full.data.snippet,
        headers: full.data.payload?.headers,
      };
    })
  );

  return detailed;
};

export const listEmailsByDate = async (
  args: { startDate: string; endDate: string; maxResults: number },
  googleIntegration: Integration
) => {
  const service = await getGmailService(googleIntegration);

  const query = `after:${args.startDate} before:${args.endDate}`;
  const res = await service.users.messages.list({
    userId: "me",
    q: query,
    maxResults: args.maxResults,
  });

  return res.data.messages || [];
};

export const getEmailById = async (
  messageId: string,
  googleIntegration: Integration
) => {
  const service = await getGmailService(googleIntegration);

  const res = await service.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  return res.data;
};

export const getThreadById = async (
  threadId: string,
  googleIntegration: Integration
) => {
  const service = await getGmailService(googleIntegration);

  const thread = await service.users.threads.get({
    userId: "me",
    id: threadId,
  });

  return thread.data;
};

export const listThreads = async (
  maxResults: number,
  googleIntegration: Integration
) => {
  const service = await getGmailService(googleIntegration);

  const res = await service.users.threads.list({
    userId: "me",
    maxResults: maxResults,
  });

  return res.data.threads || [];
};

export const listUnreadEmails = async (
  maxResults: number,
  googleIntegration: Integration
) => {
  const service = await getGmailService(googleIntegration);

  const res = await service.users.messages.list({
    userId: "me",
    q: "is:unread",
    maxResults: maxResults,
  });

  return res.data.messages || [];
};

export const markAsUnread = async (
  messageId: string,
  googleIntegration: Integration
) => {
  const service = await getGmailService(googleIntegration);

  await service.users.messages.modify({
    userId: "me",
    id: messageId,
    requestBody: {
      removeLabelIds: ["LABEL_READ"],
    },
  });
  return { success: true };
};

export const trashEmail = async (
  messageId: string,
  googleIntegration: Integration
) => {
  const service = await getGmailService(googleIntegration);

  await service.users.messages.trash({
    userId: "me",
    id: messageId,
  });
  return { success: true };
};

export const untrashEmail = async (
  messageId: string,
  googleIntegration: Integration
) => {
  const service = await getGmailService(googleIntegration);

  await service.users.messages.untrash({
    userId: "me",
    id: messageId,
  });
  return { success: true };
};

export const getLabels = async (googleIntegration: Integration) => {
  const service = await getGmailService(googleIntegration);

  const res = await service.users.labels.list({ userId: "me" });
  return res.data.labels || [];
};

export const createLabel = async (
  labelName: string,
  googleIntegration: Integration
) => {
  const service = await getGmailService(googleIntegration);

  const res = await service.users.labels.create({
    userId: "me",
    requestBody: {
      name: labelName,
      labelListVisibility: "labelShow",
      messageListVisibility: "show",
    },
  });
  return res.data;
};

export const replyToEmail = async (
  args: {
    threadId: string;
    to: string;
    subject: string;
    body: string;
    messageId: string;
  },
  googleIntegration: Integration
) => {
  const service = await getGmailService(googleIntegration);

  const rawMessage = encode({
    to: args.to,
    subject: args.subject,
    body: args.body,
    inReplyTo: args.messageId,
  });

  const res = await service.users.messages.send({
    userId: "me",
    requestBody: {
      threadId: args.threadId,
      raw: rawMessage,
    },
  });

  return res.data;
};

export const modifyEmailLabels = async (
  messageId: string,
  addLabelIds: string[] | null,
  removeLabelIds: string[] | null,
  googleIntegration: Integration
) => {
  const service = await getGmailService(googleIntegration);

  await service.users.messages.modify({
    userId: "me",
    id: messageId,
    requestBody: {
      addLabelIds: addLabelIds || [],
      removeLabelIds: removeLabelIds || [],
    },
  });
  return { success: true };
};
