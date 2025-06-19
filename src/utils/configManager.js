import { promises as fs } from 'fs';
import path from 'path';
import { CONFIG_FILE_PATH, CONFIG_DIR_PATH, DEFAULT_CONFIG } from './constants.js';
import { logger } from './logger.js';

export async function getConfig() {
  try {
    const configContent = await fs.readFile(CONFIG_FILE_PATH, 'utf-8');
    const userConfig = JSON.parse(configContent);
    // Merge with default to ensure all keys are present
    return { ...DEFAULT_CONFIG, ...userConfig };
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Config file doesn't exist, return default.
      return DEFAULT_CONFIG;
    }
    logger.error('Error reading config file:', error);
    // On other errors, still return default to allow the tool to run.
    return DEFAULT_CONFIG;
  }
}

export async function saveConfig(config) {
  try {
    await fs.mkdir(CONFIG_DIR_PATH, { recursive: true });
    await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(config, null, 2));
  } catch (error) {
    logger.error('Failed to save configuration:', error);
    throw error;
  }
}

export async function resetConfig() {
  try {
    await fs.unlink(CONFIG_FILE_PATH);
    logger.success('Configuration has been reset to defaults.');
  } catch (error) {
    if (error.code === 'ENOENT') {
      logger.warn('No configuration file found to reset.');
    } else {
      logger.error('Failed to reset configuration:', error);
      throw error;
    }
  }
}