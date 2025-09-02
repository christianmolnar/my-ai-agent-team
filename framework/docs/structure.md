# Repository Structure Guide

This document explains the organizational structure of the shared workspace.

## Top Level Organization

The repository is organized into these primary sections:

- **framework/**: Core framework components that define how the repository works (shared)
- **shared/**: Shared structure for all work areas (no personal/specific data)
- **personal/**: Personal workspace with specific task instances (gitignored, not shared)
- **.github/**: Repository configuration and Copilot instructions

## Framework Organization

The framework folder contains all the shared elements that define how the repository works:

- **templates/**: Standard templates for creating new areas and projects
- **tools/**: Shared utility scripts and tools used across different areas
- **docs/**: Documentation explaining how to use the repository structure

## Shared Structure 

The `shared/` folder contains these key elements:

- **docs/**: Shared documentation that applies across all areas
  - Contains `AI_Interaction_Guidelines.md` with principles for AI assistant usage
  - Contains other general documentation files

Each area in the `shared/` folder follows this structure:
- A `copilot_area_docs/` folder with area-specific context
  - Contains a `main.md` file that summarizes all files in this directory
- Empty project folder structure templates (specific implementations go in personal)

## Personal Workspace

The personal folder contains your personal implementation of tasks:

- Organized with whatever folder structure the user wants - though if names match areas or tasks assume it's an instance of that area or task work.
- Contains your specific implementation files and data
- Has a `copilot_docs/` folder with your current tasks

## Example Structure

```
shared-copilot-workspace/
├── .github/                             # GitHub-specific files
│   └── copilot-instructions.md          # Global Copilot instructions
│
├── framework/                           # Core framework (shared)
│   ├── templates/                       # Reusable templates 
│   │   ├── area/                        # Template for new areas
│   │   └── project/                     # Template for new projects
│   │
│   ├── tools/                           # Shared tools and utilities
│   │   ├── ConvertCSV-ToJSON.ps1
│   │   └── scripts/                     # Helper scripts
│   │
│   └── docs/                            # Framework documentation
│       ├── structure.md                 # This document
│       └── workflow.md                  # Standard workflow processes
│
├── shared/                              # All work areas (shared structure only)
│   ├── Communications/                  # Communications area structure
│   │   └── copilot_area_docs/           
│   │       └── main.md
│   │
│   ├── Connect/                         # Connect area structure
│   │   └── copilot_area_docs/
│   │       └── main.md 
│   │
│   └── Meetings/                        # Meetings area structure
│       └── copilot_area_docs/
│           └── main.md
│
└── personal/                            # Personal workspace (not shared)
    ├── Communications/                  # Personal implementations
    │   └── 2025/
    ├── Connect/
    │   └── April2025/
    ├── Meetings/
    │   └── 2025/
    ├── SuperAwesomeProject/
    └── copilot_docs/                    # Personal current tasks
```
