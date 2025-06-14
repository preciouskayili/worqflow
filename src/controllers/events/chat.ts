import { Request, Response } from "express";

export function messageEvents(req: Request, res: Response) {
  // Headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Send initial connection established message
  res.write(
    'event: connected\ndata: {"message": "Connection established"}\n\n'
  );

  // Send a message every 5 seconds
  const sendMessage = () => {
    res.write(`event: message\ndata: {"message": "Hello, world!"}\n\n`);
  };

  // Send the initial message
  sendMessage();

  // Send a message every 5 seconds
  setInterval(sendMessage, 5000);

  res.on("close", () => {
    console.log("Client disconnected");
  });
}
