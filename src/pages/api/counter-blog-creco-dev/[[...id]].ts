import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
