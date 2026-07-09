#!/usr/bin/env node
// fallstore-mcp · MCP stdio server wrapping fallstore-sdk · MIT · AI-Native Solutions
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server({ name: 'fallstore-mcp', version: '1.0.0' }, { capabilities: { tools: {} } });

const TOOLS = [
  {
    name: 'fallstore_handle_files',
    description: 'handleFiles · from fallstore-sdk',
    inputSchema: { type: 'object', properties: {} },
    handler: async (args) => {
      const { handleFiles } = await import('@ai-native-solutions/fallstore-sdk');
      return typeof handleFiles === 'function' ? await handleFiles(args) : { error: 'handleFiles not callable' };
    }
  },
  {
    name: 'fallstore_fmt',
    description: 'fmt · from fallstore-sdk',
    inputSchema: { type: 'object', properties: {} },
    handler: async (args) => {
      const { fmt } = await import('@ai-native-solutions/fallstore-sdk');
      return typeof fmt === 'function' ? await fmt(args) : { error: 'fmt not callable' };
    }
  },
  {
    name: 'fallstore_log',
    description: 'log · from fallstore-sdk',
    inputSchema: { type: 'object', properties: {} },
    handler: async (args) => {
      const { log } = await import('@ai-native-solutions/fallstore-sdk');
      return typeof log === 'function' ? await log(args) : { error: 'log not callable' };
    }
  }
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map(({ handler, ...rest }) => rest)
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const t = TOOLS.find(x => x.name === req.params.name);
  if (!t) throw new Error('unknown tool: ' + req.params.name);
  const result = await t.handler(req.params.arguments || {});
  return { content: [{ type: 'text', text: JSON.stringify(result) }] };
});

await server.connect(new StdioServerTransport());
console.error('fallstore-mcp v1.0.0 · stdio ready');
