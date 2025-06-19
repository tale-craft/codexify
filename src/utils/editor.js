import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

export function openInEditor(content) {
  return new Promise(async (resolve, reject) => {
    const editor = process.env.EDITOR || 'vim';
    const tempFilePath = path.join(os.tmpdir(), `codexify-edit-${Date.now()}.txt`);

    try {
      await fs.writeFile(tempFilePath, content);

      const editorProcess = spawn(editor, [tempFilePath], {
        stdio: 'inherit' // This is crucial for interactive use
      });

      editorProcess.on('exit', async (code) => {
        if (code === 0) {
          const updatedContent = await fs.readFile(tempFilePath, 'utf-8');
          await fs.unlink(tempFilePath); // Cleanup temp file
          resolve(updatedContent);
        } else {
          await fs.unlink(tempFilePath); // Cleanup temp file even on error
          reject(new Error(`Editor process exited with code ${code}`));
        }
      });

      editorProcess.on('error', (err) => {
        reject(new Error(`Failed to start editor: ${err.message}`));
      });

    } catch (error) {
      reject(error);
    }
  });
}