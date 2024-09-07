import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";
import unified, { ProcessorSettings, Settings } from "unified";
import type { NextApiRequest, NextApiResponse } from "next";

// case1 curl -XPOST "http://localhost:3000/api/markdown/render" -d '{ "markdown": "#test\n##test\n\n| ![](https://divopsor.github.io/blog-images/2024/05/18/the-best-welfare-is-colleagues-2-present-1.jpg) | ![](https://divopsor.github.io/blog-images/2024/05/18/the-best-welfare-is-colleagues-2-present-2.jpg) |\n| --- | --- |\n| ![](https://divopsor.github.io/blog-images/2024/05/18/the-best-welfare-is-colleagues-2-present-3.jpg) | ![](https://divopsor.github.io/blog-images/2024/05/18/the-best-welfare-is-colleagues-2.jpg) |\n" }' -H "Content-Type: application/json" | jq
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
      .use(remarkRehype, {
        handlers: (node: any) => {
          console.log(node);
          if (node.tagName === "img") {
            node.properties.loading = "lazy";
          }
        },
      })
      .use(remarkGfm)
      .use(rehypeStringify)
      .use(remarkNewlinesToBrs)
      .use(remarkImageAltToWidth)
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
    const isTable = ["table", "thead", "tbody", "tr", "td"].includes(
      parent.tagName
    );

    if (isTable) {
      if (node.value.includes("\n")) {
        // Split the text at newlines
        const parts = node.value.split("\n");
        const newNodes: any = [];
        parts.forEach((part: any, i: any) => {
          if (part !== "" || i !== parts.length - 1) {
            // Add text node for the non-empty part
            newNodes.push(u("text", part));
          }
        });
        // Replace the current text node with the new nodes
        parent.children.splice(index, 1, ...newNodes);
      }
      return;
    }

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

const remarkImageAltToWidth = () => (tree: any) => {
  visit(tree, "element", (node: any, index: any, parent: any) => {
    console.log(node);
    if (node.tagName === "img") {
      const alt = node.properties.alt as string;
      if (alt && alt.startsWith("width=")) {
        const width = alt.split(" ")[0].split("=")[1];
        node.properties.alt = alt.split(" ").slice(1).join(" ");
        node.properties.style = `width: ${width};${
          node.properties.style ? ` ${node.properties.style}` : ""
        }`;
      }
    }
  });
};
