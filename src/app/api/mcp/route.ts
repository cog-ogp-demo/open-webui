import { callMcpTool } from "@/lib/mcp-client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, tool, args } = body;

    if (!token) {
      return Response.json({ error: "Token is required" }, { status: 401 });
    }

    if (!tool) {
      return Response.json({ error: "Tool name is required" }, { status: 400 });
    }

    const result = await callMcpTool(token, tool, args || {});
    return Response.json({ success: true, data: result });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: message }, { status: 500 });
  }
}
