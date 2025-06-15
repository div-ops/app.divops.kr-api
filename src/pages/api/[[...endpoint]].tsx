import { NextApiRequest, NextApiResponse } from "next";
import { routes } from '../../constants';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const endpoint = parseEndpoint(req.query.endpoint);

    const registerRoute = createRegisterRoute(endpoint, req, res);

    let result = false;
    for (const key in routes) {
        result = await registerRoute(key, routes[key]);
        if (result) {
            console.log(`[New Architecture Routes] ${endpoint} -> ${key}`);
            break;
        }
    }

    if (result) {
        return;
    }

    await registerRoute('*', async (req, res) => {
        res.writeHead(404, 'Not Found');
        res.write('Not Found');
        res.end();
    });
    console.log(`[New Architecture Routes] ${endpoint} -> *`);
}

function parseEndpoint(endpoint?: string | string[]): string {
    if (endpoint == null) {
        return '/404';
    }

    if (typeof endpoint === 'string') {
        return endpoint;
    }

    return endpoint.join('/');
}

function createRegisterRoute(endpoint: string, request: NextApiRequest, response: NextApiResponse) {
    return async function registerRoute(path: string, handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
        if (path === '*') {
            await handler(request, response);
            return true;
        }

        if (path === endpoint) {
            await handler(request, response);
            return true;
        }

        return false;
    }
}