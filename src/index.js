// src/index.js

import { Command } from 'commander';
import { generateCommand } from './commands/generate.js';
import { configCommand } from './commands/config.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const program = new Command();

program
  .name('codexify')
  .version(pkg.version)
  .description(pkg.description)
  // 将 generate 的选项提升到 program 级别，这样主命令才能识别它们
  .option('-o, --output <filename>', 'Specify the output file name (overrides config).')
  .option('-i, --ignore <patterns...>', 'Add patterns to ignore (e.g., "*.test.js" "docs/").')
  .action((options) => {
    // 当没有子命令（如 config）被匹配时，此 action 会被触发。
    // 这意味着 `codexify` 或 `codexify -o ...` 会进入这里。
    // 我们直接调用 generateCommand，并把捕获到的 options 传递过去。
    generateCommand(options);
  });

program
  .command('generate')
  .alias('gen')
  .description('Generate the project context file (default command).')
  // generate 命令现在不再需要定义自己的 options，因为它会继承全局 options。
  // 但我们仍然需要一个 action 来处理 `codexify generate` 的显式调用。
  .action((options, command) => {
    // command.optsWithGlobals() 会合并全局选项和此命令的本地选项（如果有的话）
    generateCommand(command.optsWithGlobals());
  });

program
  .command('config')
  .description('View and manage the global configuration.')
  .action(configCommand);
  
program.parse(process.argv);