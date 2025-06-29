import { tool, RunContext } from "@openai/agents";
import { makeSlackRequest } from "../lib/misc";
import { z } from "zod";
import { TIntegrations } from "../../types/integrations";

export const listSlackChannels = tool({
  name: "list_slack_channels",
  description: "List all channels in the Slack workspace",
  parameters: z.object({}),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const channels = await makeSlackRequest(
      runContext?.context?.["slack"].access_token!,
      "conversations.list",
      "GET",
      { types: "public_channel" }
    );
    return channels.channels;
  },
});

export const getChannelInfo = tool({
  name: "get_channel_info",
  description: "Get information about a specific channel",
  parameters: z.object({
    channelId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const channel = await makeSlackRequest(
      runContext?.context?.["slack"].access_token!,
      "conversations.info",
      "GET",
      { channel: args.channelId }
    );
    return channel;
  },
});

export const getUserInfo = tool({
  name: "get_user_info",
  description: "Get information about a specific user",
  parameters: z.object({
    userId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const user = await makeSlackRequest(
      runContext?.context?.["slack"].access_token!,
      "users.info",
      "GET",
      { user: args.userId }
    );
    return user;
  },
});

export const getChannelMessages = tool({
  name: "get_channel_messages",
  description: "Get messages from a specific channel",
  parameters: z.object({
    channelId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const messages = await makeSlackRequest(
      runContext?.context?.["slack"].access_token!,
      "conversations.history",
      "GET",
      { channel: args.channelId }
    );
    return messages.messages;
  },
});

export const sendMessage = tool({
  name: "send_message",
  description: "Send a message to a specific channel",
  parameters: z.object({
    channelId: z.string(),
    message: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const response = await makeSlackRequest(
      runContext?.context?.["slack"].access_token!,
      "chat.postMessage",
      "POST",
      { channel: args.channelId, text: args.message }
    );
    return response.message.text;
  },
});

export const scheduleMessage = tool({
  name: "schedule_message",
  description: "Schedule a message to be sent to a specific channel",
  parameters: z.object({
    channelId: z.string(),
    message: z.string(),
    scheduledTime: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const response = await makeSlackRequest(
      runContext?.context?.["slack"].access_token!,
      "chat.scheduleMessage",
      "POST",
      {
        channel: args.channelId,
        text: args.message,
        scheduled_time: args.scheduledTime,
      }
    );
    return response.message.text;
  },
});

export const deleteScheduledMessage = tool({
  name: "delete_scheduled_message",
  description: "Delete a scheduled message",
  parameters: z.object({
    scheduledMessageId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const response = await makeSlackRequest(
      runContext?.context?.["slack"].access_token!,
      "chat.deleteScheduledMessage",
      "POST",
      { scheduled_message_id: args.scheduledMessageId }
    );
    return response.message.text;
  },
});

export const updateScheduledMessage = tool({
  name: "update_scheduled_message",
  description: "Update a scheduled message",
  parameters: z.object({
    scheduledMessageId: z.string(),
    message: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const response = await makeSlackRequest(
      runContext?.context?.["slack"].access_token!,
      "chat.updateScheduledMessage",
      "POST",
      { scheduled_message_id: args.scheduledMessageId, text: args.message }
    );
    return response.message.text;
  },
});

export const getScheduledMessages = tool({
  name: "get_scheduled_messages",
  description: "Get scheduled messages from a specific channel",
  parameters: z.object({
    channelId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const response = await makeSlackRequest(
      runContext?.context?.["slack"].access_token!,
      "chat.getScheduledMessages",
      "GET",
      { channel: args.channelId }
    );
    return response.messages;
  },
});

export const deleteMessage = tool({
  name: "delete_message",
  description: "Delete a message from a specific channel",
  parameters: z.object({
    channelId: z.string(),
    messageId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const response = await makeSlackRequest(
      runContext?.context?.["slack"].access_token!,
      "chat.delete",
      "POST",
      { channel: args.channelId, ts: args.messageId }
    );
    return response.message.text;
  },
});

export const sendEphemeralMessage = tool({
  name: "send_ephemeral_message",
  description: "Send an ephemeral message to a specific user",
  parameters: z.object({
    userId: z.string(),
    message: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const response = await makeSlackRequest(
      runContext?.context?.["slack"].access_token!,
      "chat.postEphemeral",
      "POST",
      { channel: args.channelId, text: args.message, user: args.userId }
    );
    return response.message.text;
  },
});

export const updateMessage = tool({
  name: "update_message",
  description: "Update a message in a specific channel",
  parameters: z.object({
    channelId: z.string(),
    messageId: z.string(),
    message: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const response = await makeSlackRequest(
      runContext?.context?.["slack"].access_token!,
      "chat.update",
      "POST",
      { channel: args.channelId, ts: args.messageId, text: args.message }
    );
    return response.message.text;
  },
});

export const getPresence = tool({
  name: "get_presence",
  description: "Get the presence of a specific user",
  parameters: z.object({
    userId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const response = await makeSlackRequest(
      runContext?.context?.["slack"].access_token!,
      "users.getPresence",
      "GET",
      { user: args.userId }
    );
    return response.presence;
  },
});

export const setStatus = tool({
  name: "set_status",
  description: "Set the status of a specific user",
  parameters: z.object({
    status: z.enum(["auto", "away"]),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const response = await makeSlackRequest(
      runContext?.context?.["slack"].access_token!,
      "users.setPresence",
      "POST",
      { presence: args.status }
    );
    return response.message.text;
  },
});

export const inviteToChannel = tool({
  name: "invite_to_channel",
  description: "Invite a user to a specific channel",
  parameters: z.object({
    channelId: z.string(),
    userId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const response = await makeSlackRequest(
      runContext?.context?.["slack"].access_token!,
      "conversations.invite",
      "POST",
      { channel: args.channelId, users: args.userId }
    );
    return response.message.text;
  },
});

export const addReaction = tool({
  name: "add_reaction",
  description: "Add a reaction to a specific message",
  parameters: z.object({
    channelId: z.string(),
    messageId: z.string(),
    reaction: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const response = await makeSlackRequest(
      runContext?.context?.["slack"].access_token!,
      "reactions.add",
      "POST",
      {
        channel: args.channelId,
        timestamp: args.messageId,
        name: args.reaction,
      }
    );
    return response.message.text;
  },
});

export const removeReaction = tool({
  name: "remove_reaction",
  description: "Remove a reaction from a specific message",
  parameters: z.object({
    channelId: z.string(),
    messageId: z.string(),
    reaction: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const response = await makeSlackRequest(
      runContext?.context?.["slack"].access_token!,
      "reactions.remove",
      "POST",
      {
        channel: args.channelId,
        timestamp: args.messageId,
        name: args.reaction,
      }
    );
    return response.message.text;
  },
});

export const unpinMessage = tool({
  name: "unpin_message",
  description: "Unpin a message from a specific channel",
  parameters: z.object({
    channelId: z.string(),
    messageId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const response = await makeSlackRequest(
      runContext?.context?.["slack"].access_token!,
      "pins.remove",
      "POST",
      { channel: args.channelId, timestamp: args.messageId }
    );
    return response.message.text;
  },
});

export const pinMessage = tool({
  name: "pin_message",
  description: "Pin a message to a specific channel",
  parameters: z.object({
    channelId: z.string(),
    messageId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const response = await makeSlackRequest(
      runContext?.context?.["slack"].access_token!,
      "pins.add",
      "POST",
      { channel: args.channelId, timestamp: args.messageId }
    );
    return response.message.text;
  },
});

export const uploadFile = tool({
  name: "upload_file",
  description: "Upload a file to a specific channel",
  parameters: z.object({
    channelId: z.string(),
    file: z.instanceof(File),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const response = await makeSlackRequest(
      runContext?.context?.["slack"].access_token!,
      "files.upload",
      "POST",
      { channel: args.channelId, file: args.file }
    );
    return response.message.text;
  },
});

export const getUnreadMessages = tool({
  name: "get_unread_messages",
  description: "Get unread messages from all joined channels",
  parameters: z.object({}),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const response = await makeSlackRequest(
      runContext?.context?.["slack"].access_token!,
      "conversations.list",
      "GET",
      { exclude_archived: true }
    );
    const channels = response.channels;
    const unreadMessages: any[] = [];
    for (const channel of channels) {
      const channelInfo = await makeSlackRequest(
        runContext?.context?.["slack"].access_token!,
        "conversations.info",
        "GET",
        { channel: channel.id }
      );
      const unreadCount = channelInfo.channel.unread_count_display;
      if (unreadCount === 0) continue;
      const history = await makeSlackRequest(
        runContext?.context?.["slack"].access_token!,
        "conversations.history",
        "GET",
        { channel: channel.id, limit: unreadCount }
      );
      unreadMessages.push(
        ...history.messages.map((message: any) => ({
          channel: channel.name,
          time: message.ts,
          text: message.text,
        }))
      );
    }
    return unreadMessages;
  },
});

export const archiveChannel = tool({
  name: "archive_channel",
  description: "Archive a specific channel",
  parameters: z.object({
    channelId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const response = await makeSlackRequest(
      runContext?.context?.["slack"].access_token!,
      "conversations.archive",
      "POST",
      { channel: args.channelId }
    );

    return response.message.text;
  },
});

export const unarchiveChannel = tool({
  name: "unarchive_channel",
  description: "Unarchive a specific channel",
  parameters: z.object({
    channelId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const response = await makeSlackRequest(
      runContext?.context?.["slack"].access_token!,
      "conversations.unarchive",
      "POST",
      { channel: args.channelId }
    );
    return response.message.text;
  },
});

export const getChannelMembers = tool({
  name: "get_channel_members",
  description: "Get members of a specific channel",
  parameters: z.object({
    channelId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const response = await makeSlackRequest(
      runContext?.context?.["slack"].access_token!,
      "conversations.members",
      "GET",
      { channel: args.channelId }
    );

    return response.members;
  },
});
