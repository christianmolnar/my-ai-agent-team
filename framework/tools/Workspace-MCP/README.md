# Workspace-MCP Server

A Model Context Protocol (MCP) server implementation using the MCP TypeScript SDK.

## Overview

This server provides a Model Context Protocol (MCP) implementation that supports:

- Server-Sent Events (SSE) transport
- Custom tools for Azure DevOps integration
- Basic math operations and hello-world example tools

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- An Azure DevOps Personal Access Token (PAT) with appropriate permissions

## Installation

1. Clone the repository or navigate to this directory
2. Install dependencies:

```bash
npm install
```

## Starting the Server

To start the Workspace-MCP server:

```bash
node server.js
```

### Startup Process

When you start the server:

1. You will be prompted to enter your Azure DevOps Personal Access Token (PAT)
2. You will be prompted to enter your Azure DevOps Base URL (default: https://dev.azure.com/CEPlanning/)
3. The server will start on port 3001 (or the port specified in the PORT environment variable)

Example output:
```
Enter your Azure DevOps Personal Access Token (PAT): [Your PAT will be hidden]
Enter your Azure DevOps Base URL (default: https://dev.azure.com/CEPlanning/): 
Workspace-MCP server is running on port 3001
Server is ready to accept connections
- SSE endpoint: http://localhost:3001/sse
```

## Available Endpoints

The server exposes the following endpoints:

- **GET /** - Root endpoint that returns a simple message
- **GET /sse** - Server-Sent Events endpoint for MCP clients to connect
- **POST /messages** - Endpoint for MCP clients to send messages

## Available Tools

The server implements the following MCP tools:

1. **add** - A simple addition tool
   - Parameters: `a` (number), `b` (number)
   - Returns: The sum of `a` and `b`

2. **hello-world** - A simple greeting tool
   - Parameters: None
   - Returns: A greeting message

3. **ado-query** - An Azure DevOps work item query tool
   - Parameters: 
     - `projectName` (string, optional) - The name of the Azure DevOps project
     - `query` (string) - The WIQL query to execute
     - `includeFields` (string[], optional) - Specific work item fields to include
   - Returns: Work items matching the query

## Connecting Clients

MCP-compatible clients can connect to this server using the SSE endpoint:

```
http://localhost:3001/sse
```

## Development

For more information about the MCP server implementation and architecture, refer to the documentation in the `copilot_area_docs` folder:

- `MCP_doc.md` - Overview of the Model Context Protocol ecosystem
- `MCP_typescriptlib_doc.md` - Documentation for the MCP TypeScript SDK

## Troubleshooting

If you encounter issues:

1. Ensure your Azure DevOps PAT has the correct permissions
2. Check that your Azure DevOps Base URL is correct
3. Verify that port 3001 is not being used by another application
4. Check the console output for any error messages
