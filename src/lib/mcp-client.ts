import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const MCP_URL = "https://gwmcp.lkcoffee.com/order/user/mcp";

export async function createMcpClient(token: string): Promise<Client> {
  const client = new Client({
    name: "luckin-coffee-app",
    version: "1.0.0",
  });

  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), {
    requestInit: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  await client.connect(transport);
  return client;
}

export async function callMcpTool(
  token: string,
  toolName: string,
  args: Record<string, unknown>
) {
  const client = await createMcpClient(token);
  try {
    const result = await client.callTool({ name: toolName, arguments: args });
    return result;
  } finally {
    await client.close();
  }
}
