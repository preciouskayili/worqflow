import { Request, Response } from "express";
import { z } from "zod";
import {
  listCalendarEvents,
  listCalendarList,
} from "../tools/googleCalendarTools";
import { AuthRequest } from "../middleware/auth";
import { IntegrationModel } from "../models/Integrations";
import { getCalendarService } from "../utils/googleapis";
import { saveMemory } from "../utils/vectorestore";

const taskSchema = z.object({
  task: z.string(),
});

function getIntegration(userId: string) {
  return IntegrationModel.findOne({ user_id: userId }).lean();
}

export async function createTask(req: AuthRequest, res: Response) {
  try {
    const result = taskSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Task is required" });
    } else {
      const { task } = result.data;
      const integration = await getIntegration(req.user._id);
      const memory = await saveMemory(result.data.task, req.user._id);

      if (!integration) {
        res.status(404).json({ message: "Integration not found" });
      } else {
        const service = await getCalendarService({
          access_token: integration.access_token!,
          refresh_token: integration.refresh_token!,
        });
        const response = await service.calendarList.list({
          maxResults: Math.min(200, 200),
        });
        const calendarList =
          response.data.items?.map((c) => ({
            id: c.id!,
            name: c.summary!,
            description: c.description ?? "",
          })) || [];

        res.status(200).json({ memory });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
