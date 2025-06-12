import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth";
import { IntegrationModel } from "../models/Integrations";
import { mainAgent } from "../agents/main";
import { run } from "@openai/agents";
import { getCalendarService } from "../utils/googleapis";
import { getDayBoundsInUTC } from "../utils/misc";

const taskSchema = z.object({
  task: z.string(),
});

async function getIntegration(userId: string) {
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

      if (!integration) {
        res.status(404).json({ message: "Integration not found" });
      } else {
        const service = await getCalendarService({
          access_token: integration.access_token!,
          refresh_token: integration.refresh_token!,
        });
        // const date = new Date("2024-05-28");
        // const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        // const endOfDay = new Date(date.setHours(24, 0, 0, 0));
        const { timeMin, timeMax } = getDayBoundsInUTC(
          new Date("2025-05-28"),
          "Africa/Lagos"
        );

        const response = await service.events.list({
          calendarId: "primary",
          singleEvents: true,
          orderBy: "startTime",
          timeMin,
          timeMax,
        });

        // const response = await service.events.list({
        //   calendarId: "preciouskayili@gmail.com",
        //   timeMin: startOfDay.toISOString(),
        //   timeMax: endOfDay.toISOString(),
        //   singleEvents: true,
        //   orderBy: "startTime",
        // });

        // const { output } = await run(mainAgent, task, {
        //   context: {
        //     userId: req.user._id,
        //     access_token: integration.access_token!,
        //     refresh_token: integration.refresh_token!,
        //   },
        // });

        res.status(200).json({ events: response.data.items });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
