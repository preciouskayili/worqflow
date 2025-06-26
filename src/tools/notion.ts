import { RunContext, tool } from "@openai/agents";
import { z } from "zod";
import { UserInfo } from "../../types/user";
import { getNotionClient } from "../lib/misc";

export const listNotionPages = tool({
  name: "list_notion_pages",
  description: "List all pages in the user's Notion workspace",
  parameters: z.object({}),
  async execute(_, runContext?: RunContext<UserInfo>) {
    const notion = await getNotionClient(
      runContext?.context.userId.toString()!
    );
    const res = await notion.search({});
    return res.results;
  },
});

export const searchNotionPages = tool({
  name: "search_notion_pages",
  description: "Search for Notion pages by title or content",
  parameters: z.object({ query: z.string() }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const notion = await getNotionClient(
      runContext?.context.userId.toString()!
    );
    const res = await notion.search({ query: args.query });
    return res.results;
  },
});

export const getNotionPageContent = tool({
  name: "get_notion_page_content",
  description: "Get the content of a Notion page",
  parameters: z.object({ pageId: z.string() }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const notion = await getNotionClient(
      runContext?.context.userId.toString()!
    );
    const blocks = await notion.blocks.children.list({ block_id: args.pageId });
    return blocks.results;
  },
});

export const createNotionPage = tool({
  name: "create_notion_page",
  description: "Create a new Notion page",
  parameters: z.object({
    title: z.string(),
    parentId: z.string().optional(),
    content: z.string().optional(),
  }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const notion = await getNotionClient(
      runContext?.context.userId.toString()!
    );
    const res = await notion.pages.create({
      parent: { page_id: args.parentId! },
      properties: {
        title: [
          {
            type: "text",
            text: { content: args.title },
          },
        ],
      },
      children: args.content
        ? [
            {
              object: "block",
              type: "paragraph",
              paragraph: {
                rich_text: [
                  {
                    type: "text",
                    text: { content: args.content },
                  },
                ],
              },
            },
          ]
        : [],
    });
    return res;
  },
});

export const updateNotionPage = tool({
  name: "update_notion_page",
  description: "Append content to an existing Notion page",
  parameters: z.object({
    pageId: z.string(),
    content: z.string(),
  }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const notion = await getNotionClient(
      runContext?.context.userId.toString()!
    );
    const res = await notion.blocks.children.append({
      block_id: args.pageId,
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: { content: args.content },
              },
            ],
          },
        },
      ],
    });
    return res;
  },
});
