# Workflow Process Guide

This document outlines the standard workflow processes for using this repository.

## Essential Documentation Files

When working in this repository, these documentation files are critical:

### In each shared's copilot_shared_docs folder:

#### main.md (in copilot_area_docs/ for the Area you're in - if you don't know from the prompt, ask!)

- **Purpose**: Serves as an index and summary of all other files in the area's copilot_area_docs folder
- **Update**: When adding or modifying any file in the copilot_area_docs folder
- **Format**: Use headers (##) for each file with brief descriptions underneath
- **Content**: Provide a brief overview of each file's purpose and when it should be used
- **Importance**: Read this file first when working in a specific area to understand available resources

### Workflow Process

Always follow this process at the start of a conversation, or bad things will happen!

1. At the beginning of every task:
   - Identify relevant areas in the `shared/` folder by looking for matching area names or task categories
   - For task-related requests, check `shared/tasks/` to find relevant task documentation
   - For area-specific requests, check `shared/areas/` to find appropriate area documentation
   - Read the main.md file in the corresponding copilot_area_docs/ folder to understand available resources
2. If working across multiple areas, determine primary and secondary areas to prioritize documentation
3. Update documents based on significant changes, not minor steps
4. If conflicting information is found between documents, ask for clarification
5. For tasks requiring user action, provide detailed, step-by-step instructions with:
   - Numbered lists for sequential steps
   - Code blocks for commands or code snippets
   - All necessary details for ease of use

## Creating New Shared and Projects

To create a new shared or project:

1. Use the templates in `framework/templates/`
2. Copy the appropriate template to create your shared or project structure
3. Update the main.md file in the copilot_shared_docs folder

## Working with Personal Tasks

Your personal task implementations should:

1. Follow the same structure as the shared areas
2. Keep all specific implementations in your personal folder
