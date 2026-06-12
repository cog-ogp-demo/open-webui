# Luckin Coffee MCP Ordering App

A web application that interacts with [Luckin Coffee's MCP (Model Context Protocol) server](https://open.lkcoffee.com/mcp) to provide an AI-powered coffee ordering experience.

## Features

- **Store Finder** - Find nearby Luckin Coffee stores using geolocation or search by name
- **Product Search** - Search the menu with quick suggestions (Americano, Latte, Mocha, etc.)
- **Shopping Cart** - Add/remove items, adjust quantities
- **Order Preview** - See pricing, discounts, and coupon applications before ordering
- **Order Creation** - Place orders with WeChat payment QR code generation
- **Order Management** - Check order status and cancel orders

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- TypeScript
- Tailwind CSS
- [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk) for Streamable HTTP MCP client

## Getting Started

```bash
cd luckin-coffee-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You'll need a Bearer token from [open.lkcoffee.com/mcp](https://open.lkcoffee.com/mcp) - log in there and copy the token.

## MCP Server Details

- **URL**: `https://gwmcp.lkcoffee.com/order/user/mcp`
- **Transport**: Streamable HTTP
- **Auth**: Bearer token

### Available Tools (8)

| Tool | Description |
|------|-------------|
| `queryShopList` | Find stores by location (longitude/latitude) |
| `searchProductForMcp` | Search products by text query |
| `switchProduct` | Change product attributes (size, sugar, etc.) |
| `queryProductDetailInfo` | Get full product details |
| `previewOrder` | Preview order with pricing and discounts |
| `createOrder` | Place an order and get payment URL |
| `queryOrderDetailInfo` | Check order status and pickup code |
| `cancelOrder` | Cancel a pending order |

## Architecture

```
src/
├── app/
│   ├── api/mcp/route.ts    # Backend proxy to MCP server
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main app (step-based flow)
├── components/
│   ├── TokenInput.tsx       # Auth token entry
│   ├── ShopFinder.tsx       # Store search/select
│   ├── ProductSearch.tsx    # Menu browsing
│   ├── Cart.tsx             # Shopping cart
│   ├── OrderPreviewPanel.tsx # Order preview & confirm
│   └── OrderSuccess.tsx     # Post-order status
└── lib/
    ├── api.ts               # Client-side API helpers
    ├── mcp-client.ts        # MCP SDK client wrapper
    └── types.ts             # TypeScript interfaces
```

## Configuration

The MCP endpoint URL is configured in `src/lib/mcp-client.ts`. The app uses the official `@modelcontextprotocol/sdk` to communicate with the Streamable HTTP MCP server.

No environment variables are required - the user provides their token at runtime.
