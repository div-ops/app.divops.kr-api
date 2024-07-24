import type { NextApiRequest, NextApiResponse } from "next";

const testHTML = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Upload Image to GitHub</title>
</head>
<body>
  <h1>Upload Image to GitHub</h1>
  <form id="uploadForm" enctype="multipart/form-data">
    <label for="file">Choose image:</label><br>
    <input type="file" id="file" name="file" accept="image/*" required><br><br>
    
    <label for="message">파일 경로</label><br>
    <input type="text" id="filepath" name="filepath" required><br><br>
    
    <input type="submit" value="Upload">
  </form>

  <script>
    document.getElementById('uploadForm').addEventListener('submit', async function(event) {
      event.preventDefault();

      const formData = new FormData();
      formData.append('file', document.getElementById('file').files[0]);
      formData.append('filepath', document.getElementById('filepath').value);

      const response = await fetch('/api/static-zicdding/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      alert(result.message);
    });
  </script>
</body>
</html>

`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    return res.status(200).send(testHTML);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
