export async function mcpCall(
  token: string,
  tool: string,
  args: Record<string, unknown> = {}
) {
  const res = await fetch("/api/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, tool, args }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "Request failed");
  }

  // MCP tool results come as content array with text items
  if (json.data?.content) {
    for (const item of json.data.content) {
      if (item.type === "text") {
        try {
          return JSON.parse(item.text);
        } catch {
          return item.text;
        }
      }
    }
  }

  return json.data;
}

export async function queryShops(
  token: string,
  longitude: number,
  latitude: number,
  deptName?: string
) {
  return mcpCall(token, "queryShopList", {
    longitude,
    latitude,
    ...(deptName ? { deptName } : {}),
  });
}

export async function searchProducts(
  token: string,
  deptId: number,
  query: string
) {
  return mcpCall(token, "searchProductForMcp", { deptId, query });
}

export async function getProductDetail(
  token: string,
  deptId: number,
  productId: number
) {
  return mcpCall(token, "queryProductDetailInfo", { deptId, productId });
}

export async function switchProductAttr(
  token: string,
  deptId: number,
  productId: number,
  skuCode: string,
  attrOperationParam: {
    attributeId: number;
    subAttr: { attributeId: number; operation: number };
  },
  amount: number
) {
  return mcpCall(token, "switchProduct", {
    deptId,
    productId,
    skuCode,
    attrOperationParam,
    amount,
  });
}

export async function previewOrder(
  token: string,
  deptId: number,
  productList: { amount: number; productId: number; skuCode: string }[]
) {
  return mcpCall(token, "previewOrder", { deptId, productList });
}

export async function createOrder(
  token: string,
  deptId: number,
  productList: { amount: number; productId: number; skuCode: string }[],
  longitude: number,
  latitude: number,
  couponCodeList?: string[]
) {
  return mcpCall(token, "createOrder", {
    deptId,
    productList,
    longitude,
    latitude,
    ...(couponCodeList?.length ? { couponCodeList } : {}),
  });
}

export async function getOrderDetail(token: string, orderId: string) {
  return mcpCall(token, "queryOrderDetailInfo", { orderId });
}

export async function cancelOrder(token: string, orderId: string) {
  return mcpCall(token, "cancelOrder", { orderId });
}
