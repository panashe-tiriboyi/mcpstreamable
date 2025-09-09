import express, { Request, Response } from "express";
import {
  queryAzureDevOpsWorkItems,
  queryAzureDevOpsWorkItemsById,
} from "./devops.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const server = new McpServer({
  name: "mcp-streamable-http",
  version: "1.0.0",
});

// Get DevOps work item tool
const getDevopsWorkItems = server.tool(
  "get-devops-work-items",
  "Get Azure DevOps work items from the last week",
  {
    organization: z.string().describe("Azure DevOps organization name"),
    project: z.string().describe("Azure DevOps project name"),
    personalAccessToken: z
      .string()
      .describe("Personal Access Token for Azure DevOps"),
  },
  async (params: {
    organization: string;
    project: string;
    personalAccessToken: string;
  }) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const wiqlQuery = `SELECT * FROM WorkItems WHERE [System.TeamProject] = '${params.project}' AND [System.CreatedDate] > '2025-09-02'`;

    try {
      const result = await queryAzureDevOpsWorkItems(
        params.organization,
        params.project,
        params.personalAccessToken,
        wiqlQuery
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error("Failed to query work items:", error);
      throw new Error("Failed to retrieve work items from Azure DevOps");
    }
  }
);

const getDevopsWorkItemById = server.tool(
  "get-devops-work-item-by-id",
  "Get Azure DevOps work item by ID",
  {
    organization: z.string().describe("Azure DevOps organization name"),
    project: z.string().describe("Azure DevOps project name"),
    personalAccessToken: z
      .string()
      .describe("Personal Access Token for Azure DevOps"),
    id: z.string().describe("ID of the Azure DevOps work item"), // <-- Add this line
  },
  async (params: {
    organization: string;
    project: string;
    personalAccessToken: string;
    id: string; // <-- Add this line
  }) => {
    try {
      const result = await queryAzureDevOpsWorkItemsById(
        params.organization,
        params.project,
        params.personalAccessToken,
        params.id // <-- Pass the id here
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error("Failed to query work item:", error);
      throw new Error("Failed to retrieve work item from Azure DevOps");
    }
  }
);

const app = express();
app.use(express.json());

const transport: StreamableHTTPServerTransport =
  new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // set to undefined for stateless servers
  });

// Setup routes for the server
const setupServer = async () => {
  await server.connect(transport);
};

app.post("/mcp", async (req: Request, res: Response) => {
  console.log("Received MCP request:", req.body);
  try {
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

app.get("/mcp", async (req: Request, res: Response) => {
  console.log("Received GET MCP request");
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    })
  );
});

app.delete("/mcp", async (req: Request, res: Response) => {
  console.log("Received DELETE MCP request");
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    })
  );
});

// Start the server
const PORT = process.env.PORT || 3000;
setupServer()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`MCP Streamable HTTP Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to set up the server:", error);
    process.exit(1);
  });
