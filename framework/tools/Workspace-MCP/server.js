import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { EnhancedSSEServerTransport } from './enhancedTransport.js';
import { z } from 'zod';
import axios from 'axios';
import readline from 'readline-sync';
import { DefaultAzureCredential } from '@azure/identity';
import { execSync } from 'child_process';

// Prompt for PAT (optional)
const pat = readline.question('Enter Azure DevOps PAT (optional, press Enter to use Azure AD auth): ', {
  hideEchoBack: true,
  keepWhitespace: true
});

// Get baseUrl with default option
const defaultBaseUrl = 'https://office.visualstudio.com/';
const baseUrl = readline.question(`Enter your Azure DevOps Base URL (default: ${defaultBaseUrl}): `) || defaultBaseUrl;

// Instantiate Azure AD Credential
const credential = new DefaultAzureCredential();
const adoScope = "499b84ac-1321-427f-aa17-267ca6975798/.default"; // Azure DevOps scope

// Helper function to get Azure AD token or use PAT
async function getAdoAuthHeader() {
  if (pat && pat.trim() !== '') {
    console.log("Using provided PAT for authentication.");
    return `Basic ${Buffer.from(`:${pat}`).toString('base64')}`;
  } else {
    console.log("No PAT provided, attempting Azure AD authentication.");
    try {
      // Check if user is logged in to Azure CLI
      execSync('az account show', { stdio: 'ignore' }); // Throws error if not logged in
      console.log("Azure CLI login detected.");
    } catch (error) {
      console.error("Azure CLI login check failed.");
      console.error("Please run 'az login' in your terminal to authenticate with Azure.");
      console.error("After successfully logging in, please restart this server.");
      throw new Error("Azure AD authentication requires an active Azure CLI login. Please run 'az login' and restart the server.");
    }

    try {
      const accessToken = await credential.getToken(adoScope);
      console.log("Successfully obtained Azure AD token.");
      return `Bearer ${accessToken.token}`;
    } catch (error) {
      console.error("Failed to get Azure AD token:", error);
      // Added more specific advice here as well
      throw new Error("Azure AD authentication failed. Ensure you are logged in via 'az login', have the necessary permissions, and then restart the server.");
    }
  }
}

// Import additional utilities
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const util = require('util');
// Note: z is already imported at the top of the file

// Initialize the MCP Server with proper initialization parameters
const server = new McpServer({
  name: "Workspace-MCP",
  version: "1.0.0",
  
  // Configure the server with enhanced initialization capabilities
  serverOptions: {
    onInitialize: async (params) => {
      console.log('Received initialize request with params:', JSON.stringify(params, null, 2));
      
      return {
        serverInfo: {
          name: "Workspace-MCP",
          version: "1.0.0"
        },
        capabilities: {
          supportedProtocolVersions: ["2024-11-05"],
          supportedTransports: ["serverSentEvents"],
          tools: {}
        }
      };
    }
  }
});

// Set up the Express app
const app = express();
app.use(express.json());

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Add root route handler
app.get('/', (req, res) => {
  res.send('Model Context Protocol Server - Use the /sse endpoint to connect');
});

// Store transports by session ID
const transports = {};
server.tool("add",
  { a: z.number(), b: z.number() },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }]
  })
);

// Define the Hello World tool
server.tool(
  "hello-world",
  "Literally just returns Hello World with a surprise string after",
  async () => {
    try {
      // If project is not specified, get the first project
      return {
        content: [
          {
            type: "text",
            text: "Hello World!  This string is definitely a surprise!"
          }
        ]
      };
    } catch (error) {
      console.error('Error with Hello World', error);
      return {
        content: [
          {
            type: "text",
            text: `Error with Hello World: ${error.message}`
          }
        ]
      };
    }
  }
);

// Define the ADO query tool
server.tool(
  "ado-query",
  "Execute a WIQL query or a saved query by ID in Azure DevOps and retrieve work item details.",
  {
    projectName: z.string().optional().describe("The name of the Azure DevOps project. If not provided, the query will run against the default project."),
    query: z.string().optional().describe("The WIQL query to execute in Azure DevOps."),
    queryId: z.string().optional().describe("The ID of a saved query to execute in Azure DevOps."),
    includeFields: z.array(z.string()).optional().describe("Specific work item fields to include in the response.")
  },
  async ({ projectName, query, queryId, includeFields }) => {
    try {
      // Get Auth Header using Azure AD
      const authHeader = await getAdoAuthHeader();

      // Determine the project to use
      let projectPath = "";
      if (projectName) {
        projectPath = `${projectName}/`;
      }
      
      let wiqlResponse;
      
      // Check if we're using a queryId or a direct WIQL query
      if (queryId) {
        console.log(`Executing ADO saved query with ID: ${queryId} for project: ${projectName || 'default'}`);
        
        // Execute the saved query to get work item references
        wiqlResponse = await axios({
          method: 'get',
          url: `${baseUrl}${projectPath}_apis/wit/queries/${queryId}?api-version=7.0&$expand=wiql`,
          headers: {
            'Authorization': authHeader
          }
        });
        
        // For saved queries, the actual results need to be executed using the WIQL
        if (wiqlResponse.data && wiqlResponse.data.wiql) {
          console.log(`Retrieved saved query with WIQL: ${wiqlResponse.data.wiql}`);
          
          // Now execute the WIQL from the saved query
          wiqlResponse = await axios({
            method: 'post',
            url: `${baseUrl}${projectPath}_apis/wit/wiql?api-version=7.0`,
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json'
            },
            data: {
              query: wiqlResponse.data.wiql
            }
          });
        } else {
          throw new Error('Saved query does not contain a valid WIQL statement');
        }
      } else if (query) {
        console.log(`Executing direct WIQL query for project: ${projectName || 'default'}`);
        
        // Prepare the query payload for direct WIQL query
        const queryPayload = {
          query: query
        };
        
        // Execute the WIQL query to get work item references
        wiqlResponse = await axios({
          method: 'post',
          url: `${baseUrl}${projectPath}_apis/wit/wiql?api-version=7.0`,
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          },
          data: queryPayload
        });
      } else {
        throw new Error('Either query or queryId must be provided');
      }      console.log(`WIQL query response: ${JSON.stringify(wiqlResponse.data, null, 2)}`);
      
      console.log(`WIQL query executed. Found ${wiqlResponse.data.workItems?.length || 0} work items.`);
      
      // If no work items found, return early
      if (!wiqlResponse.data.workItems || wiqlResponse.data.workItems.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No work items found matching the query."
            }
          ]
        };
      }
      
      // Extract work item IDs and prepare for batch retrieval
      const workItemIds = wiqlResponse.data.workItems.map(wi => wi.id);
      
      // Construct the fields parameter if includeFields is specified
      let fieldsParam = "";
      if (includeFields && includeFields.length > 0) {
        fieldsParam = `&fields=${includeFields.join(",")}`;
      }
      
      // Get the work items with their details (in batches of 200 if needed)
      const batchSize = 200;
      let allWorkItems = [];
      
      for (let i = 0; i < workItemIds.length; i += batchSize) {
        const batchIds = workItemIds.slice(i, i + batchSize);
        
        const workItemsResponse = await axios({
          method: 'get',
          url: `${baseUrl}_apis/wit/workitems?ids=${batchIds.join(",")}&api-version=7.0${fieldsParam}`,
          headers: {
            'Authorization': authHeader
          }
        });
        
        if (workItemsResponse.data.value) {
          allWorkItems = [...allWorkItems, ...workItemsResponse.data.value];
        }
      }
      
      console.log(`Retrieved details for ${allWorkItems.length} work items.`);
      
      // Format the work items into a useful response
      const formattedItems = allWorkItems.map(item => {
        const fields = item.fields || {};
        
        return {
          id: item.id,
          url: item.url,
          title: fields["System.Title"] || "No Title",
          state: fields["System.State"] || "Unknown",
          assignedTo: fields["System.AssignedTo"]?.displayName || "Unassigned",
          // Include all fields that were returned
          fields: fields
        };      });        // Format the results as a JSON blob returned as text
      
      // Create a result object that includes query information and work items
      const resultObject = {
        totalCount: formattedItems.length,
        queryInfo: {
          queryId: queryId || null,
          queryString: query || null
        },
        workItems: formattedItems
      };
      
      // Convert the result object to a formatted JSON string
      const jsonOutput = JSON.stringify(resultObject, null, 2);
      
      return {
        content: [
          {
            type: "text",
            text: jsonOutput
          }
        ]
      };
    } catch (error) {
      console.error('Error executing ADO query:', error);
      
      // Provide a detailed error message
      let errorMessage = `Error executing ADO query: ${error.message}`;
      
      // Add additional details if available
      if (error.response) {
        errorMessage += `\nStatus: ${error.response.status}`;
        if (error.response.data) {
          try {
            errorMessage += `\nDetails: ${JSON.stringify(error.response.data)}`;
          } catch (e) {
            errorMessage += `\nDetails: Unable to parse error details`;
          }
        }
      }
      
      return {
        content: [
          {
            type: "text",
            text: errorMessage
          }
        ]
      };
    }
  }
);

// Define the ADO update tool
server.tool(
  "ado-update",
  "Update fields on an Azure DevOps work item.",
  {
    workItemId: z.number().int().positive().describe("The ID of the work item to update."),
    updates: z.record(z.string(), z.any()).describe("An object containing the fields to update. Keys are field reference names (e.g., 'System.State'), values are the new field values."),
    projectName: z.string().optional().describe("The name of the Azure DevOps project. If omitted, the update is attempted at the organization level."),
    comment: z.string().optional().describe("An optional comment to add to the work item's history.")
  },
  async ({ workItemId, updates, projectName, comment }) => {
    try {
      const authHeader = await getAdoAuthHeader();
      const projectPath = projectName ? `${projectName}/` : "";
      const apiUrl = `${baseUrl}${projectPath}_apis/wit/workitems/${workItemId}?api-version=7.0`;

      // Construct the JSON Patch document for the update
      const patchDocument = Object.entries(updates).map(([key, value]) => ({
        op: "add",
        path: `/fields/${key}`,
        value: value
      }));

      // Add comment to history if provided
      if (comment) {
        patchDocument.push({
          op: "add",
          path: "/fields/System.History",
          value: comment
        });
      }

      console.log(`Attempting to update work item ${workItemId} in project '${projectName || 'org level'}' with payload: ${JSON.stringify(patchDocument, null, 2)}`);

      const response = await axios({
        method: 'patch',
        url: apiUrl,
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json-patch+json'
        },
        data: patchDocument
      });

      console.log(`Successfully updated work item ${workItemId}. Response status: ${response.status}`);

      // Return the updated work item details
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2)
          }
        ]
      };

    } catch (error) {
      console.error(`Error updating ADO work item ${workItemId}:`, error);
      let errorMessage = `Error updating ADO work item ${workItemId}: ${error.message}`;
      if (error.response) {
        errorMessage += `\\nStatus: ${error.response.status}`;
        if (error.response.data) {
          try {
            errorMessage += `\\nDetails: ${JSON.stringify(error.response.data)}`;
          } catch (e) {
            errorMessage += `\\nDetails: Unable to parse error details`;
          }
        }
      }
      return {
        content: [
          {
            type: "text",
            text: errorMessage
          }
        ]
      };
    }
  }
);

// These route handlers and middleware are already defined above

// Set up SSE endpoint with improved stream handling
app.get("/sse", async (req, res) => {
  console.log('New SSE connection request received');
  
  // Create a heartbeat to keep the connection alive
  const heartbeat = setInterval(() => {
    if (res.writableEnded) {
      clearInterval(heartbeat);
      return;
    }
    try {
      res.write(': ping\n\n');
    } catch (error) {
      console.error('Error writing heartbeat:', error);
      clearInterval(heartbeat);
    }
  }, 15000);
    // Create and register the transport using our enhanced implementation
  try {
    const transport = new EnhancedSSEServerTransport('/messages', res);
    console.log(`Created new transport with session ID: ${transport.sessionId}`);
    transports[transport.sessionId] = transport;
    
    // Clean up on connection close
    res.on("close", () => {
      console.log(`Connection closed for session ID: ${transport.sessionId}`);
      clearInterval(heartbeat);
      delete transports[transport.sessionId];
    });
    
    // Connect the transport to the server
    await server.connect(transport);
    console.log(`Transport connected successfully for session ID: ${transport.sessionId}`);
  } catch (error) {
    console.error('Error in SSE connection:', error);
    clearInterval(heartbeat);
    res.end();
  }
});

// Enhanced message endpoint for SSE
app.post("/messages", express.text({ type: '*/*' }), async (req, res) => {
  const sessionId = req.query.sessionId;
  console.log(`Received message for session ID: ${sessionId}`);
  
  if (!sessionId) {
    console.error('No sessionId provided in request');
    return res.status(400).send('No sessionId provided');
  }
  
  const transport = transports[sessionId];
  
  if (transport) {
    try {
      console.log(`Processing message for session ${sessionId}`);
      
      // Debug the incoming message
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          console.log('Message is not valid JSON:', body);
        }
      }
      console.log('Message content:', body);
      
      // Handle the message
      await transport.handlePostMessage(req, res);
      console.log(`Message processed for session ${sessionId}`);
    } catch (error) {
      console.error(`Error handling post message for session ${sessionId}:`, error);
      
      // Send a more graceful error response
      if (!res.headersSent) {
        res.status(500).json({ 
          error: error.message,
          errorType: error.constructor.name,
          details: 'An error occurred while processing the message'
        });
      } else {
        console.error('Headers already sent, could not send error response');
      }
    }
  } else {
    console.error(`No transport found for sessionId: ${sessionId}`);
    res.status(400).send('No transport found for sessionId');
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Workspace-MCP server is running on port ${PORT}`);
  console.log('Server is ready to accept connections');
  console.log(`- SSE endpoint: http://localhost:${PORT}/sse`);
});
