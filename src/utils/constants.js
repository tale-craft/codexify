import path from 'path';
import os from 'os';

export const CONFIG_DIR_PATH = path.join(os.homedir(), '.codexify');
export const CONFIG_FILE_PATH = path.join(CONFIG_DIR_PATH, 'config.json');

export const DEFAULT_IGNORE_PATTERNS = [
  // General
  '.DS_Store',
  '*.log',
  '*.lock',
  '.idea/',
  '.vscode/',
  '*.sublime-project',
  '*.sublime-workspace',

  // Node.js
  'node_modules/',
  'dist/',
  'build/',
  'coverage/',
  'pnpm-lock.yaml',
  'yarn.lock',
  'package-lock.json',

  // Git
  '.git/',

  // Binary/Assets - a reasonable default set
  '*.png', '*.jpg', '*.jpeg', '*.gif', '*.svg',
  '*.ico', '*.webp', '*.tiff', '*.bmp',
  '*.pdf', '*.doc', '*.docx', '*.xls', '*.xlsx',
  '*.ppt', '*.pptx',
  '*.mp4', '*.webm', '*.mkv', '*.mov',
  '*.mp3', '*.wav', '*.ogg',
  '*.zip', '*.tar', '*.gz', '*.rar',
  '*.iso', '*.dmg',
  '*.font', '*.woff', '*.woff2',
];

export const DEFAULT_PROMPT_TEMPLATE = `
完全不用顾及阅读你回答的人的感受，请把你的推理能力开到极致，深入思考。

你需要认真阅读 {{projectName}} 项目的目录结构和文件内容，并回答用户的问题。

## Directory Structure

\`\`\`
{{TREE}}
\`\`\`

## File Contents

{{CODE}}

下面是用户的问题，先认真思考，告诉我你计划怎么做，以及整个的代码架构文件划分：
`;

export const DEFAULT_CONFIG = {
  outputFileName: 'codexify-context.txt',
  promptTemplate: DEFAULT_PROMPT_TEMPLATE,
  ignorePatterns: DEFAULT_IGNORE_PATTERNS,
};