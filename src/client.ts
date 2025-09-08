import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const client = new Client({
  name: "example-client",
  version: "1.0.0"
});

const transport = new StreamableHTTPClientTransport(new URL("http://localhost:3000/mcp"));
await client.connect(transport);

// List tools
const tools = await client.listTools();
console.log("Discovered tools:", tools);

// Call a tool
const result = await client.callTool({
  name: "get-chuck-joke",
  arguments: {}
});
console.log("Tool result:", result);