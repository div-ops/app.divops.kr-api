import * as calendar from "@googleapis/calendar";
import { format, subDays, addDays, toDate } from "date-fns";

const auth = new calendar.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
});

export const CalendarService = {
  getCalendarEvents: async ({
    calendarId,
    from,
    to,
    pageSize = 1000,
  }: {
    calendarId: string;
    from?: Date;
    to?: Date;
    pageSize?: number;
  }) => {
    const calendarClient = calendar.calendar({ version: "v3", auth });
    const res = await calendarClient.events.list({
      calendarId,
      timeMin: from
        ? from.toISOString()
        : subDays(new Date(), 30).toISOString(),
      timeMax: to ? to.toISOString() : addDays(new Date(), 30).toISOString(),
      maxResults: pageSize,
      singleEvents: true,
    });

    const data = (res.data?.items ?? [])
      .filter((x) => x.status !== "cancelled")
      .map((x) => {
        const startDate = new Date(x?.start?.dateTime!).toLocaleString(
          "en-US",
          { timeZone: "Asia/Seoul" }
        );
        const endDate = new Date(x?.end?.dateTime!).toLocaleString("en-US", {
          timeZone: "Asia/Seoul",
        });

        return {
          name: x.summary || "No title",
          startDate: format(startDate, "yyyy-MM-dd"),
          endDate: format(endDate, "yyyy-MM-dd"),
          startTime: format(startDate, "HH:mm"),
          endTime: format(endDate, "HH:mm"),
          minutes: Math.floor(
            (new Date(x?.end?.dateTime!).getTime() -
              new Date(x?.start?.dateTime!).getTime()) /
              60000
          ),
          hours:
            (new Date(x?.end?.dateTime!).getTime() -
              new Date(x?.start?.dateTime!).getTime()) /
            60000 /
            60,
        };
      });

    data.sort((a, b) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    return data;
  },
};
