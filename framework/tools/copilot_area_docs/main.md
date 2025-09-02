# Tools Documentation Index

This document serves as an index and summary of the tools available in the Tools folder, providing a quick overview of each tool's purpose and when it should be used.

## Available Tools

### Workspace-MCP
- **Purpose**: Implements a Model Context Protocol (MCP) server using the TypeScript SDK.
- **When to use**: Use this server implementation when you need to create an MCP-compatible application or service.
- **Main files**:
  - `server.js` - The main MCP server implementation
  - `enhancedTransport.js` - Custom transport implementation
  - `package.json` - Project dependencies and configuration
- **Documentation**: See the `Tools/Workspace-MCP/copilot_area_docs/` folder for detailed documentation.

### ConvertCSV-ToJSON.ps1
- **Purpose**: PowerShell script to convert CSV files to JSON format.
- **When to use**: Use this script when you need to transform data from CSV format to JSON format for data processing or integration.
- **Usage**:
  ```powershell
  .\Tools\ConvertCSV-ToJSON.ps1 -InputCSVFile "path\to\input.csv" [-OutputJSONFile "path\to\output.json"]
  ```
- **Note**: If no output file is specified, the script will use the same name as the input file with a .json extension.

### Get-DocxText.ps1
- **Purpose**: PowerShell script to extract text content from Microsoft Word (.docx) files.
- **When to use**: Use this script when you need to get the text from a .docx file to be processed by other tools or pasted into a chat. This is particularly useful when direct .docx file reading is not supported by an application.
- **Usage**:
  ```powershell
  .\framework\tools\scripts\Get-DocxText.ps1 -FilePath "C:\path\to\your\document.docx"
  ```
- **Note**: This script requires Microsoft Word to be installed on the machine where the script is run. It will open Word in the background to read the document. If you encounter script execution policy errors, you may need to run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in your PowerShell session first.

## Using These Tools

When working with these tools:
1. Review the specific documentation for each tool before use
2. Ensure any required dependencies are installed
3. Follow the usage guidelines provided in the documentation
