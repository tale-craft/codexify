# Codexify

Codexify is a powerful command-line interface (CLI) tool designed to help developers create comprehensive, single-file context summaries of their projects. It's built specifically for interacting with large language models (LLMs) like GPT-4, Claude, or Llama.

By recursively scanning your project, it generates a file containing:
1.  A clean, text-based directory tree.
2.  The complete, line-numbered content of all non-ignored source files.

This allows you to paste your entire project's context into an LLM prompt in a single, organized block.

## Features

-   **Automatic File Traversal**: Recursively scans directories and files.
-   **Smart Ignore System**: Automatically uses your project's `.gitignore` file and provides a robust default ignore list.
-   **Highly Configurable**:
    -   Customize the final prompt template.
    -   Manage a global list of ignore patterns.
    -   Set a default output filename.
-   **Interactive Configuration**: Uses a friendly interactive menu for all settings.
-   **Editor Integration**: Opens your default system editor (`$EDITOR` or `vim`) for easy, multi-line editing of configurations.
-   **Binary File Detection**: Automatically detects and skips binary files (images, archives, etc.).

## Installation

To use `codexify` anywhere on your system, install it globally using npm:

```bash
npm install -g codexify