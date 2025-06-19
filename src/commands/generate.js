import path from 'path';
import { promises as fs } from 'fs';
import createIgnore from 'ignore';
import { getConfig } from '../utils/configManager.js';
import { logger } from '../utils/logger.js';
import { getProjectStructure, aggregateFileContents } from '../utils/fileSystem.js';

export async function generateCommand(options) {
  logger.info('Starting context generation...');
  const rootDir = process.cwd();
  
  // 1. Load configuration and initialize ignore instance
  const config = await getConfig();
  const ig = createIgnore();

  // 2. Aggregate ignore patterns from all sources (priority order)
  // Default -> Global Config -> .gitignore -> CLI args
  ig.add(config.ignorePatterns);

  const gitignorePath = path.join(rootDir, '.gitignore');
  try {
    const gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
    ig.add(gitignoreContent);
    logger.dim('Loaded rules from .gitignore');
  } catch (error) {
    // It's okay if .gitignore doesn't exist
    if (error.code !== 'ENOENT') {
      logger.warn('Could not read .gitignore:', error.message);
    }
  }
  
  if (options.ignore && options.ignore.length > 0) {
    ig.add(options.ignore);
    logger.dim(`Added ${options.ignore.length} custom ignore patterns from CLI.`);
  }

  // 3. Generate file structure tree and get list of files
  logger.info('Scanning project structure...');
  const { tree, filePaths } = await getProjectStructure(rootDir, ig);
  logger.success('Project structure scanned.');

  // 4. Aggregate content from all non-ignored files
  logger.info(`Aggregating content from ${filePaths.length} files...`);
  const code = await aggregateFileContents(filePaths, rootDir);
  logger.success('File content aggregated.');

  // 5. Assemble the final prompt
  const projectName = path.basename(rootDir);
  let finalPrompt = config.promptTemplate
    .replace('{{projectName}}', projectName)
    .replace('{{TREE}}', tree)
    .replace('{{CODE}}', code);

  // 6. Write to output file
  const outputFileName = options.output || config.outputFileName;
  const outputPath = path.join(rootDir, outputFileName);
  try {
    await fs.writeFile(outputPath, finalPrompt);
    logger.success(`\nProject context successfully generated at: ${outputPath}`);
  } catch (error) {
    logger.error('Failed to write output file:', error);
  }
}