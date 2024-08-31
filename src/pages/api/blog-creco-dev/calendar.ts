import type { NextApiRequest, NextApiResponse } from "next";
import { CalendarService } from "../../../service/calendar";
import { toDate } from "date-fns";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const calendarId = req.query.calendarId;
    const from = req.query.from ? toDate(req.query.from as string) : undefined;
    const to = req.query.to ? toDate(req.query.to as string) : undefined;
    const pageSize = req.query.pageSize
      ? Number(req.query.pageSize)
      : undefined;

    if (calendarId == null || typeof calendarId !== "string") {
      return res.status(400).json({ message: "Invalid calendarId" });
    }

    if (pageSize != null && isNaN(Number(pageSize))) {
      return res.status(400).json({ message: "Invalid pageSize" });
    }

    const calendarEvents = await CalendarService.getCalendarEvents({
      calendarId,
      from,
      to,
      pageSize,
    });

    // 성공 응답에 Cache-Control 헤더 추가 (10분 동안 캐시)
    res.setHeader(
      "Cache-Control",
      "public, max-age=600, stale-while-revalidate=59"
    );

    return res.status(200).json({
      calendarEvents: calendarEvents.map((x) => ({
        ...x,
        name: x.name.split("/")[0].trim(),
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
