import fs from "fs";
import { exec } from "child_process";

export async function receiveFile(req, res) {
  try {
    const file = req.file;

    if (!file) {
      console.error("No file uploaded");
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = file.path;
    const language = file.originalname.split(".").pop();

    const commands = {
      js: `node ${filePath}`,
      c: `gcc ${filePath} -o ${filePath}.out && chmod +x ${filePath}.out && ${filePath}.out`,
      go: `go run ${filePath}`,
      py: `python ${filePath}`,
      cpp: `g++ ${filePath} -o ${filePath}.out && chmod +x ${filePath}.out && ${filePath}.out`,
    };

    const command = commands[language];

    fs.chmodSync(filePath, "755");
    console.log("Command to execute:", command);

    if (!command) {
      console.error("Invalid file uploaded");
      return res.status(400).json({ message: "Invalid file uploaded" });
    }

    try {
      exec(command, { timeout: 5000 }, (err, stdout, stderr) => {
        if (err) {
          console.error("Execution Error:", stderr || err.message);
          return res.status(400).json({ error: stderr || err.message });
        }

        console.log("Execution Output:", stdout);
        res.status(200).json({ output: stdout });
      });
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.error("Unhandled Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
