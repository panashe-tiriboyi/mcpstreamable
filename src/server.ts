import express, { Request, Response } from "express";
import {
  queryAzureDevOpsWorkItems,
  queryAzureDevOpsWorkItemsById,
} from "./devops.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

export interface Config {
  DevOpsPersonalAccessToken: string;
  Organization: string;
  Project: string;
}

// Get the equivalent of __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function loadConfig(): Config {
  const configPath = path.join(__dirname, "..", "appsettings.json");
  const configFile = fs.readFileSync(configPath, "utf-8");
  return JSON.parse(configFile);
}

const config = loadConfig();

const server = new McpServer({
  name: "mcp-streamable-http",
  version: "1.0.0",
});

// Get DevOps work item tool
const getDevopsWorkItems = server.tool(
  "get-devops-work-items",
  "Get Azure DevOps work items from the last week",

  async () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const wiqlQuery = `SELECT * FROM WorkItems WHERE [System.TeamProject] = '${config.Project}' AND [System.CreatedDate] > '2025-09-02'`;

    try {
      const result = await queryAzureDevOpsWorkItems(
        config.Organization,
        config.Project,
        config.DevOpsPersonalAccessToken,
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
    id: z.string().describe("ID of the Azure DevOps work item"),
  },
  async (params: { id: string }) => {
    try {
      const result = await queryAzureDevOpsWorkItemsById(
        config.Organization,
        config.Project,
        config.DevOpsPersonalAccessToken,
        params.id
      );

      // List of fields to exclude from fields object
      const excludeFields = [
        "Microsoft.VSTS.Common.AcceptanceCriteria",
        "Microsoft.VSTS.Common.StateChangeDate",
        "Microsoft.VSTS.Common.Priority",
        "Microsoft.VSTS.Common.ValueArea",
        "Microsoft.VSTS.Common.BacklogPriority",
        "Custom.Prioritylabel",
        "WEF_B3FED8AD69D747B6AC8B9F6676FE00D5_Kanban.Column",
        "WEF_B3FED8AD69D747B6AC8B9F6676FE00D5_Kanban.Column.Done",
        "WEF_E3D5FEEF0D5C4CD29F6F67FAC6285285_Kanban.Column",
        "WEF_E3D5FEEF0D5C4CD29F6F67FAC6285285_Kanban.Column.Done",
        "WEF_0385387BCAE24F04812DCCA8DDDCACCF_Kanban.Column",
        "WEF_0385387BCAE24F04812DCCA8DDDCACCF_Kanban.Column.Done",
        "WEF_79A5E30B13314406B1F0E7D6F6C55286_Kanban.Column",
        "WEF_79A5E30B13314406B1F0E7D6F6C55286_Kanban.Column.Done",
        "WEF_200960F548D74851B0D1C2812ACEE989_Kanban.Column",
        "WEF_200960F548D74851B0D1C2812ACEE989_Kanban.Column.Done",
        "Custom.2de39240-faed-4fe3-b801-ef09f9fd7649",
        "multilineFieldsFormat",
      ];

      // Remove unwanted fields from the result.fields object
      if (result && result.fields) {
        const fields = result.fields as Record<string, any>;
        for (const field of excludeFields) {
          delete fields[field];
        }
      }

      // Remove unwanted root-level properties
      if (result) {
        const resultObj = result as Record<string, any>;
        delete resultObj.multilineFieldsFormat;
        delete resultObj._links;
        delete resultObj.url;
      }

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

const getDevopsWorkItemsWithDetails = server.tool(
  "get-devops-work-items-with-details",
  "Get Azure DevOps work items from the last week with full details",
  {},
  async () => {
    try {
      const wiqlQuery = `SELECT * FROM WorkItems WHERE [System.TeamProject] = '${config.Project}' AND [System.CreatedDate] > '2025-09-08'`;

      const workItemsResponse = await queryAzureDevOpsWorkItems(
        config.Organization,
        config.Project,
        config.DevOpsPersonalAccessToken,
        wiqlQuery
      );

      // List of fields to exclude from fields object
      const excludeFields = [
        "Microsoft.VSTS.Common.AcceptanceCriteria",
        "Microsoft.VSTS.Common.StateChangeDate",
        "Microsoft.VSTS.Common.Priority",
        "Microsoft.VSTS.Common.ValueArea",
        "Microsoft.VSTS.Common.BacklogPriority",
        "Custom.Prioritylabel",
        "WEF_B3FED8AD69D747B6AC8B9F6676FE00D5_Kanban.Column",
        "WEF_B3FED8AD69D747B6AC8B9F6676FE00D5_Kanban.Column.Done",
        "WEF_E3D5FEEF0D5C4CD29F6F67FAC6285285_Kanban.Column",
        "WEF_E3D5FEEF0D5C4CD29F6F67FAC6285285_Kanban.Column.Done",
        "WEF_0385387BCAE24F04812DCCA8DDDCACCF_Kanban.Column",
        "WEF_0385387BCAE24F04812DCCA8DDDCACCF_Kanban.Column.Done",
        "WEF_79A5E30B13314406B1F0E7D6F6C55286_Kanban.Column",
        "WEF_79A5E30B13314406B1F0E7D6F6C55286_Kanban.Column.Done",
        "WEF_200960F548D74851B0D1C2812ACEE989_Kanban.Column",
        "WEF_200960F548D74851B0D1C2812ACEE989_Kanban.Column.Done",
        "Custom.2de39240-faed-4fe3-b801-ef09f9fd7649",
        "multilineFieldsFormat",
      ];

      // Fetch full details for each work item in parallel
      const details = await Promise.all(
        workItemsResponse.workItems.map(async (item) => {
          const detail = await queryAzureDevOpsWorkItemsById(
            config.Organization,
            config.Project,
            config.DevOpsPersonalAccessToken,
            String(item.id)
          );

          // Remove unwanted fields from the fields object
          if (detail && detail.fields) {
            const fields = detail.fields as Record<string, any>;
            for (const field of excludeFields) {
              delete fields[field];
            }
          }

          // Remove unwanted root-level properties
          if (detail) {
            const detailObj = detail as Record<string, any>;
            delete detailObj.multilineFieldsFormat;
            delete detailObj._links;
            delete detailObj.url;
          }

          return detail;
        })
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(details, null, 2),
          },
        ],
      };
    } catch (error) {
      // filepath: c:\Users\panashe\Desktop\projects2025\4.3 AI - MCP Server\src\server.ts
      console.error("Failed to query work items with details:", error);
      if (error instanceof Error) {
        return {
          content: [
            {
              type: "text",
              text: error.stack || error.message,
            },
          ],
          isError: true,
        };
      }
      throw new Error(
        "Failed to retrieve work items with details from Azure DevOps"
      );
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
