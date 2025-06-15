import { NextApiRequest, NextApiResponse } from "next";
import { helloHandler } from "./handlers/hello";
import { helloWorldHandler } from "./handlers/hello/world";
import { statsHandler } from "./handlers/blog/stats";

export const routes: Record<string, (req: NextApiRequest, res: NextApiResponse) => Promise<void>> = {
    'hello': helloHandler,
    'hello/world': helloWorldHandler,
    'blog/stats': statsHandler,
};
