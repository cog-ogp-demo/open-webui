"use client";

import { useState } from "react";

interface TokenInputProps {
  onTokenSet: (token: string) => void;
}

export default function TokenInput({ onTokenSet }: TokenInputProps) {
  const [token, setToken] = useState("");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Luckin Coffee</h1>
          <p className="mt-2 text-gray-600">
            Order coffee via AI-powered MCP
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <label
            htmlFor="token"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Bearer Token
          </label>
          <input
            id="token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your token from open.lkcoffee.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
          />
          <button
            onClick={() => {
              if (token.trim()) onTokenSet(token.trim());
            }}
            disabled={!token.trim()}
            className="mt-4 w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Connect
          </button>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              Get your token by logging in at{" "}
              <a
                href="https://open.lkcoffee.com/mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                open.lkcoffee.com/mcp
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
