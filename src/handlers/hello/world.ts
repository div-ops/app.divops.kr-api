import { NextApiRequest, NextApiResponse } from "next";

export async function helloWorldHandler(request: NextApiRequest, response: NextApiResponse) {
    const { ...args } = request.query;
    console.log(args);

    response.send('Hello World!')
}
