import { promises as fs } from 'fs';
import path from 'path';
import { logger } from './logger.js';

const BINARY_CHECK_BYTES = 1024; // Read first 1KB to check for binary
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit per file

async function isBinary(filePath) {
  const buffer = Buffer.alloc(BINARY_CHECK_BYTES);
  let fd;
  try {
    fd = await fs.open(filePath, 'r');
    const { bytesRead } = await fd.read(buffer, 0, BINARY_CHECK_BYTES, 0);
    await fd.close();
    
    // An empty file is not binary
    if (bytesRead === 0) return false;
    
    // Check for null bytes, a strong indicator of binary content
    for (let i = 0; i < bytesRead; i++) {
      if (buffer[i] === 0) {
        return true;
      }
    }
    return false;
  } catch (error) {
    if (fd) await fd.close();
    logger.warn(`Could not read file for binary check: ${filePath}`);
    return true; // Treat as binary on error to be safe
  }
}

export async function getProjectStructure(rootDir, ig) {
  const filePaths = [];
  let tree = '';

  async function walk(currentDir, prefix = '') {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const fullPath = path.join(currentDir, entry.name);
        // Path relative to the root for ignore checking
        const relativePath = path.relative(rootDir, fullPath);

        if (ig.ignores(relativePath)) {
            continue;
        }

        const connector = i === entries.length - 1 ? '└── ' : '├── ';
        tree += `${prefix}${connector}${entry.name}\n`;

        if (entry.isDirectory()) {
            const newPrefix = prefix + (i === entries.length - 1 ? '    ' : '│   ');
            await walk(fullPath, newPrefix);
        } else if (entry.isFile()) {
            filePaths.push(fullPath);
        }
    }
  }

  tree = path.basename(rootDir) + '\n';
  await walk(rootDir);
  return { tree, filePaths };
}


export async function aggregateFileContents(filePaths, rootDir) {
  let aggregatedContent = '';

  for (const filePath of filePaths) {
    try {
      const stats = await fs.stat(filePath);
      if (stats.size > MAX_FILE_SIZE) {
        logger.warn(`Skipping large file (${(stats.size / 1024 / 1024).toFixed(2)}MB): ${path.relative(rootDir, filePath)}`);
        continue;
      }

      if (await isBinary(filePath)) {
        logger.dim(`Skipping binary file: ${path.relative(rootDir, filePath)}`);
        continue;
      }

      const content = await fs.readFile(filePath, 'utf-8');
      const numberedContent = content
        .split('\n')
        .map((line, index) => `${String(index + 1).padStart(4, ' ')} | ${line}`)
        .join('\n');

      const relativePath = path.relative(rootDir, filePath);
      aggregatedContent += `\n--- FILE: ${relativePath} ---\n\n${numberedContent}\n`;

    } catch (error) {
      logger.warn(`Could not read file, skipping: ${path.relative(rootDir, filePath)}`);
    }
  }

  return aggregatedContent;
}