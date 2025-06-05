import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'OPTIONS') {
    const origin = req.headers['origin'] as string;
    console.log({ origin })
    if (origin === 'https://blog.creco.dev' || origin === 'http://localhost:3000') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.status(403).end();
      return;
    }

    res.setHeader('Allow', 'OPTIONS, GET, POST');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).end();
    return;
  }

  const { id: _id, count } = req.query;

  if (_id == null) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const [id, additionalPath] = Array.isArray(_id) ? _id : [_id];

  const targetUrl =
    additionalPath === 'set' ?
      `https://api.counterapi.dev/v1/counter-blog-creco-dev/${id}/set${count == null ? '' : `?count=${count}`}`
      : `https://api.counterapi.dev/v1/counter-blog-creco-dev/${id}/${count == null ? '' : `?count=${count}`}`;
  const response = await fetch(targetUrl, {
    method: req.method,
    body: req.method === "POST" ? JSON.stringify(req.body) : undefined,
  });
  try {
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error: any) {
    res.status(400).send(error.message);
  }
}
