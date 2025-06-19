import inquirer from 'inquirer';
import { getConfig, saveConfig, resetConfig } from '../utils/configManager.js';
import { openInEditor } from '../utils/editor.js';
import { logger } from '../utils/logger.js';

export async function configCommand() {
  const config = await getConfig();

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Codexify Configuration',
      choices: [
        { name: 'Edit Prompt Template', value: 'editPrompt' },
        { name: 'Edit Global Ignore Patterns', value: 'editIgnores' },
        { name: 'Change Default Output Filename', value: 'editOutput' },
        new inquirer.Separator(),
        { name: 'View Current Configuration', value: 'view' },
        { name: 'Reset to Default Configuration', value: 'reset' },
        new inquirer.Separator(),
        { name: 'Exit', value: 'exit' },
      ],
    },
  ]);

  switch (action) {
    case 'editPrompt': {
      try {
        const newTemplate = await openInEditor(config.promptTemplate);
        config.promptTemplate = newTemplate;
        await saveConfig(config);
        logger.success('Prompt template updated successfully.');
      } catch (error) {
        logger.error('Failed to update prompt template:', error.message);
      }
      break;
    }
    
    case 'editIgnores': {
      try {
        const ignoresAsString = config.ignorePatterns.join('\n');
        const newIgnoresAsString = await openInEditor(ignoresAsString);
        config.ignorePatterns = newIgnoresAsString.split('\n').map(line => line.trim()).filter(Boolean);
        await saveConfig(config);
        logger.success('Global ignore patterns updated successfully.');
      } catch (error) {
        logger.error('Failed to update ignore patterns:', error.message);
      }
      break;
    }

    case 'editOutput': {
      const { newName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'newName',
          message: 'Enter the new default output filename:',
          default: config.outputFileName,
        },
      ]);
      config.outputFileName = newName;
      await saveConfig(config);
      logger.success(`Default output filename changed to: ${newName}`);
      break;
    }

    case 'view': {
      logger.info('--- Current Configuration ---');
      console.log(JSON.stringify(config, null, 2));
      logger.info('---------------------------');
      break;
    }

    case 'reset': {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Are you sure you want to reset all settings to their default values?',
          default: false,
        },
      ]);
      if (confirm) {
        await resetConfig();
      } else {
        logger.info('Reset cancelled.');
      }
      break;
    }

    case 'exit':
      logger.info('Exiting configuration.');
      break;
  }
}