import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { formatHomePageData } from "../services/homeDataFormatter";

export async function getHomePage(req: AuthRequest, res: Response) {
  try {
    const userId = req.user._id.toString();
    const userName = req.user.name || "";

    const response = await formatHomePageData(userId, userName);

    res.status(200).json(response);
  } catch (error: any) {
    console.error("Error fetching home page data:", error);
    res.status(500).json({
      message: "Failed to fetch home page data",
      error: error.message,
    });
  }
}
