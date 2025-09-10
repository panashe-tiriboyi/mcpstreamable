import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
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

const client = new Client({
  name: "example-client",
  version: "1.0.0",
});

const transport = new StreamableHTTPClientTransport(
  new URL("http://localhost:3000/mcp")
);
await client.connect(transport);

// List tools
const tools = await client.listTools();
console.log("Discovered tools:", tools);

// Call Azure DevOps work items tool
const config = loadConfig();
// const devOpsResult = await client.callTool({
//   name: "get-devops-work-items",
// });

// console.log("Azure DevOps work items:", devOpsResult);

// const devOpsResultById = await client.callTool({
//   name: "get-devops-work-item-by-id",
//   arguments: {
//     id: "55401",
//   },
// });

// console.log("Azure DevOps work items:", devOpsResultById);

const devopsWorkItemsWithDetails = await client.callTool({
  name: "get-devops-work-items-with-details",
  arguments: {}, // <-- pass an empty object
});

console.log(
  "Azure DevOps work items with details:",
  devopsWorkItemsWithDetails
);
