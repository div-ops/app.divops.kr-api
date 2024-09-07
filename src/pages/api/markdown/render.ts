import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";
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
      .use(remarkGfm)
      .use(rehypeStringify)
      .use(remarkNewlinesToBrs)
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
const visit = require("unist-util-visit");
const u = require("unist-builder");

const remarkNewlinesToBrs = () => (tree: any) => {
  visit(tree, "text", (node: any, index: any, parent: any) => {
    if (node.value.includes("\n")) {
      // Split the text at newlines
      const parts = node.value.split("\n");
      const newNodes: any = [];
      parts.forEach((part: any, i: any) => {
        if (part !== "") {
          // Add text node for the non-empty part
          newNodes.push(u("text", part));
        }
        if (i !== parts.length - 1) {
          // Add a `br` element node for each newline, except after the last part
          newNodes.push(u("element", { tagName: "br" }, []));
        }
      });
      // Replace the current text node with the new nodes
      parent.children.splice(index, 1, ...newNodes);
    }
  });
};
