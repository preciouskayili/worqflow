import { tool } from "@openai/agents";
import { z } from "zod";
import { getGmailService } from "../lib/googleapis";
import { RunContext } from "@openai/agents";
import { gmail_v1 } from "googleapis";

type UserInfo = {
  access_token: string;
  refresh_token: string;
  expires_at?: string;
};

export const listEmails = tool({
  name: "list_emails",
  description: "Lists emails from the user's inbox with optional filtering",
  parameters: z.object({
    maxResults: z.number().int().positive().default(10),
    query: z.string().optional(),
    labelIds: z.array(z.string()).optional(),
    includeSpamTrash: z.boolean().default(false),
  }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const service = await getGmailService(runContext?.context!);

    const response = await service.users.messages.list({
      userId: "me",
      maxResults: args.maxResults,
      q: args.query,
      labelIds: args.labelIds,
      includeSpamTrash: args.includeSpamTrash,
    });

    const messages = response.data.messages || [];
    const detailedMessages = await Promise.all(
      messages.map(async (message) => {
        const details = await service.users.messages.get({
          userId: "me",
          id: message.id!,
        });
        return formatEmail(details.data);
      })
    );

    return detailedMessages;
  },
});

export const getEmail = tool({
  name: "get_email",
  description: "Gets a specific email by its ID",
  parameters: z.object({
    messageId: z.string(),
  }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const service = await getGmailService(runContext?.context!);

    const response = await service.users.messages.get({
      userId: "me",
      id: args.messageId,
    });

    return formatEmail(response.data);
  },
});

export const sendEmail = tool({
  name: "send_email",
  description: "Sends an email to specified recipients",
  parameters: z.object({
    to: z.array(z.string()),
    subject: z.string(),
    body: z.string(),
    cc: z.array(z.string()).optional(),
    bcc: z.array(z.string()).optional(),
    replyTo: z.string().optional(),
  }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const service = await getGmailService(runContext?.context!);

    const message = createEmailMessage(args);
    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    const response = await service.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    return {
      messageId: response.data.id,
      threadId: response.data.threadId,
      labelIds: response.data.labelIds,
      success: true,
    };
  },
});

export const replyToEmail = tool({
  name: "reply_to_email",
  description: "Replies to a specific email",
  parameters: z.object({
    messageId: z.string(),
    body: z.string(),
    subject: z.string().optional(),
  }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const service = await getGmailService(runContext?.context!);

    // Get the original message to extract headers
    const originalMessage = await service.users.messages.get({
      userId: "me",
      id: args.messageId,
    });

    const headers = originalMessage.data.payload?.headers || [];
    const subject = headers.find((h) => h.name === "Subject")?.value || "";
    const from = headers.find((h) => h.name === "From")?.value || "";
    const to = headers.find((h) => h.name === "To")?.value || "";
    const messageId = headers.find((h) => h.name === "Message-ID")?.value || "";
    const references =
      headers.find((h) => h.name === "References")?.value || "";

    const replySubject =
      args.subject || (subject.startsWith("Re:") ? subject : `Re: ${subject}`);

    const message = createReplyMessage({
      to: [from],
      subject: replySubject,
      body: args.body,
      inReplyTo: messageId,
      references: references || messageId,
    });

    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    const response = await service.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    return {
      messageId: response.data.id,
      threadId: response.data.threadId,
      labelIds: response.data.labelIds,
      success: true,
    };
  },
});

export const searchEmails = tool({
  name: "search_emails",
  description: "Searches for emails using Gmail search operators",
  parameters: z.object({
    query: z.string(),
    maxResults: z.number().int().positive().default(10),
  }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const service = await getGmailService(runContext?.context!);

    const response = await service.users.messages.list({
      userId: "me",
      maxResults: args.maxResults,
      q: args.query,
    });

    const messages = response.data.messages || [];
    const detailedMessages = await Promise.all(
      messages.map(async (message) => {
        const details = await service.users.messages.get({
          userId: "me",
          id: message.id!,
        });
        return formatEmail(details.data);
      })
    );

    return detailedMessages;
  },
});

export const getLabels = tool({
  name: "get_labels",
  description: "Gets all Gmail labels",
  parameters: z.object({}),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const service = await getGmailService(runContext?.context!);

    const response = await service.users.labels.list({
      userId: "me",
    });

    return (
      response.data.labels?.map((label) => ({
        id: label.id,
        name: label.name,
        type: label.type,
        messageListVisibility: label.messageListVisibility,
        labelListVisibility: label.labelListVisibility,
      })) || []
    );
  },
});

export const createLabel = tool({
  name: "create_label",
  description: "Creates a new Gmail label",
  parameters: z.object({
    name: z.string(),
    messageListVisibility: z.enum(["show", "hide"]).optional(),
    labelListVisibility: z.enum(["labelShow", "labelHide"]).optional(),
  }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const service = await getGmailService(runContext?.context!);

    const response = await service.users.labels.create({
      userId: "me",
      requestBody: {
        name: args.name,
        messageListVisibility: args.messageListVisibility,
        labelListVisibility: args.labelListVisibility,
      },
    });

    return {
      id: response.data.id,
      name: response.data.name,
      type: response.data.type,
      messageListVisibility: response.data.messageListVisibility,
      labelListVisibility: response.data.labelListVisibility,
    };
  },
});

export const modifyEmailLabels = tool({
  name: "modify_email_labels",
  description: "Adds or removes labels from an email",
  parameters: z.object({
    messageId: z.string(),
    addLabelIds: z.array(z.string()).optional(),
    removeLabelIds: z.array(z.string()).optional(),
  }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const service = await getGmailService(runContext?.context!);

    const response = await service.users.messages.modify({
      userId: "me",
      id: args.messageId,
      requestBody: {
        addLabelIds: args.addLabelIds,
        removeLabelIds: args.removeLabelIds,
      },
    });

    return {
      messageId: response.data.id,
      threadId: response.data.threadId,
      labelIds: response.data.labelIds,
      success: true,
    };
  },
});

export const markAsRead = tool({
  name: "mark_as_read",
  description: "Marks an email as read by removing the UNREAD label",
  parameters: z.object({
    messageId: z.string(),
  }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const service = await getGmailService(runContext?.context!);

    const response = await service.users.messages.modify({
      userId: "me",
      id: args.messageId,
      requestBody: {
        removeLabelIds: ["UNREAD"],
      },
    });

    return {
      messageId: response.data.id,
      threadId: response.data.threadId,
      labelIds: response.data.labelIds,
      success: true,
    };
  },
});

export const markAsUnread = tool({
  name: "mark_as_unread",
  description: "Marks an email as unread by adding the UNREAD label",
  parameters: z.object({
    messageId: z.string(),
  }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const service = await getGmailService(runContext?.context!);

    const response = await service.users.messages.modify({
      userId: "me",
      id: args.messageId,
      requestBody: {
        addLabelIds: ["UNREAD"],
      },
    });

    return {
      messageId: response.data.id,
      threadId: response.data.threadId,
      labelIds: response.data.labelIds,
      success: true,
    };
  },
});

export const trashEmail = tool({
  name: "trash_email",
  description: "Moves an email to trash",
  parameters: z.object({
    messageId: z.string(),
  }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const service = await getGmailService(runContext?.context!);

    const response = await service.users.messages.trash({
      userId: "me",
      id: args.messageId,
    });

    return {
      messageId: response.data.id,
      threadId: response.data.threadId,
      labelIds: response.data.labelIds,
      success: true,
    };
  },
});

export const untrashEmail = tool({
  name: "untrash_email",
  description: "Removes an email from trash",
  parameters: z.object({
    messageId: z.string(),
  }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const service = await getGmailService(runContext?.context!);

    const response = await service.users.messages.untrash({
      userId: "me",
      id: args.messageId,
    });

    return {
      messageId: response.data.id,
      threadId: response.data.threadId,
      labelIds: response.data.labelIds,
      success: true,
    };
  },
});

// Helper functions
function formatEmail(message: gmail_v1.Schema$Message) {
  const headers = message.payload?.headers || [];
  const subject = headers.find((h) => h.name === "Subject")?.value || "";
  const from = headers.find((h) => h.name === "From")?.value || "";
  const to = headers.find((h) => h.name === "To")?.value || "";
  const date = headers.find((h) => h.name === "Date")?.value || "";
  const cc = headers.find((h) => h.name === "Cc")?.value || "";
  const bcc = headers.find((h) => h.name === "Bcc")?.value || "";

  let body = "";
  if (message.payload?.body?.data) {
    body = Buffer.from(message.payload.body.data, "base64").toString("utf-8");
  } else if (message.payload?.parts) {
    const textPart = message.payload.parts.find(
      (part) => part.mimeType === "text/plain" && part.body?.data
    );
    if (textPart?.body?.data) {
      body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
    }
  }

  return {
    id: message.id,
    threadId: message.threadId,
    subject,
    from,
    to,
    cc,
    bcc,
    date,
    body,
    labelIds: message.labelIds,
    snippet: message.snippet,
  };
}

function createEmailMessage(args: {
  to: string[];
  subject: string;
  body: string;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
}) {
  const to = args.to.join(", ");
  const cc = args.cc?.join(", ") || "";
  const bcc = args.bcc?.join(", ") || "";
  const replyTo = args.replyTo || "";

  const message = [
    `To: ${to}`,
    `Subject: ${args.subject}`,
    ...(cc && [`Cc: ${cc}`]),
    ...(bcc && [`Bcc: ${bcc}`]),
    ...(replyTo && [`Reply-To: ${replyTo}`]),
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    args.body,
  ].join("\r\n");

  return message;
}

function createReplyMessage(args: {
  to: string[];
  subject: string;
  body: string;
  inReplyTo: string;
  references: string;
}) {
  const message = [
    `To: ${args.to.join(", ")}`,
    `Subject: ${args.subject}`,
    `In-Reply-To: ${args.inReplyTo}`,
    `References: ${args.references}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    args.body,
  ].join("\r\n");

  return message;
}
