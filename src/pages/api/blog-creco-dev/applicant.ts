import type { NextApiRequest, NextApiResponse } from "next";
import { GistService } from "../../../service/gist";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const githubId = req.query.githubId as string;
    const { items } = await GistService.getContent(
      "6b1ffeca3118faa51147f8a19a5c7766"
    );
    const { totalCount, applicants } = JSON.parse(items[0].body.contents);
    const completedCount = applicants.filter(
      (x: any) => x.status === "done"
    ).length;
    const inProgressCount = applicants.filter(
      (x: any) => x.status === "ing"
    ).length;
    const waitingCount = applicants.filter(
      (x: any) => x.status === "wait"
    ).length;

    const applicant = applicants.find(
      (applicant: any) => applicant.githubId === githubId
    );

    if (applicant == null) {
      return res.status(404).json({
        message: "Not Found",
        errorMessage: "해당하는 githubId의 지원자가 없습니다.",
      });
    }

    return res.status(200).json({
      totalCount,
      githubId: githubId,
      queueNumber:
        applicants.findIndex(
          (applicant: any) => applicant.githubId === githubId
        ) + 1,
      completedCount,
      inProgressCount,
      waitingCount,
      status: applicant.status,
    });
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", errorMessage: error.message });
  }
}
