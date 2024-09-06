import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import unified, { ProcessorSettings, Settings } from "unified";

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const markdown = req.body.markdown as string;

    if (markdown == null || markdown === "") {
      return res.status(200).json({ data: "" });
    }

    const file = await unified()
      .use(remarkParse as ProcessorSettings<Settings>)
      .use(remarkRehype)
      .use(rehypeStringify)
      .process(markdown);

    return res.status(200).json({
      data: String(file),
    });
  } catch (error: any) {
    res
      .status(400)
      .json({ message: "Internal server error", errorMessage: error.message });
  }
}
