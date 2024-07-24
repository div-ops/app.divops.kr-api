import multer from "multer";
import path from "path";
import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import { promisify } from "util";

const readFile = promisify(fs.readFile);

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = `/tmp/uploads`;

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const GITHUB_API_URL = "https://api.github.com";
const GITHUB_REPO_OWNER = "Zicdding";
const GITHUB_REPO_NAME = "fe-static-cdn";
const GITHUB_TOKEN = process.env.STATIC_ZICDDING_UPLOAD;

const getGithubHeaders = () => ({
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  "Content-Type": "application/json",
});

const getRepoSHA = async (path: string) => {
  const response = await fetch(
    `${GITHUB_API_URL}/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${path}`,
    {
      method: "GET",
      headers: getGithubHeaders(),
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null; // 파일이 존재하지 않으면 SHA는 null
    }
    throw new Error("Failed to fetch file SHA from GitHub");
  }

  const data = await response.json();
  return data.sha;
};

const createOrUpdateFile = async (
  filePath: string,
  content: string,
  message: string
) => {
  const sha = await getRepoSHA(filePath);

  const response = await fetch(
    `${GITHUB_API_URL}/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${filePath}`,
    {
      method: "PUT",
      headers: getGithubHeaders(),
      body: JSON.stringify({
        message,
        content,
        ...(sha == null ? {} : { sha }),
      }),
    }
  );

  if (!response.ok) {
    console.log(response);
    throw new Error("Failed to create or update file on GitHub");
  }

  return await response.json();
};

export default function handler(
  req: NextApiRequest & { file: { originalname: string } },
  res: NextApiResponse
) {
  if (req.method === "POST") {
    upload.single("file")(req as any, res as any, async function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const filepath = (() => {
        const filepath = req.body.filepath;
        if (IMAGE_EXTENSIONS.some((x) => filepath.endsWith(x))) {
          return filepath;
        }
        if (filepath.endsWith("/")) {
          return `${filepath}${req.file.originalname}`;
        }
        return `${filepath}/${req.file.originalname}`;
      })();

      const filePath = path.join(uploadDir, req.file.originalname);
      const fileContent = await readFile(filePath, "base64");

      const now = new Date();
      const OriginalFilePath = `${now.getFullYear()}/${
        now.getMonth() + 1
      }/${now.getDate()}/${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

      try {
        const result = await createOrUpdateFile(
          filepath,
          fileContent,
          `Uploaded ${filepath}`
        );

        const originResult = await createOrUpdateFile(
          `${OriginalFilePath}/${Date.now()}-${req.file.originalname}`,
          fileContent,
          `Uploaded ${filepath}`
        );

        res.status(200).json({
          message: "File uploaded and committed successfully",
          result,
          originResult,
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      } finally {
        fs.rmSync(filePath);
      }
    });
  } else {
    res.status(405).json({ error: `Method not allowed(${req.method})` });
  }
}

const IMAGE_EXTENSIONS = [
  ".apng",
  ".png",
  ".avif",
  ".gif",
  ".jpg",
  ".jpeg",
  ".jfif",
  ".pjpeg",
  ".pjp",
  ".png",
  ".svg",
  ".webp",
];
