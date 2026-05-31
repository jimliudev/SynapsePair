// ─── Walrus testnet endpoints ─────────────────────────────────────────────────
export const WALRUS_PUBLISHER =
  import.meta.env.VITE_WALRUS_PUBLISHER_URL ||
  'https://publisher.walrus-testnet.walrus.space'

export const WALRUS_AGGREGATOR =
  import.meta.env.VITE_WALRUS_AGGREGATOR_URL ||
  'https://aggregator.walrus-testnet.walrus.space'

export const WALRUS_EPOCHS = Number(import.meta.env.VITE_WALRUS_EPOCHS || 5)

// ─── Sui configuration ────────────────────────────────────────────────────────
export const SUI_NETWORK = import.meta.env.VITE_SUI_NETWORK || 'testnet'

/** Deployed contract package ID — set VITE_PACKAGE_ID after `sui client publish` */
export const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || ''

export const MODULE_NAME = 'synapse_pair'

// ─── AI configuration ─────────────────────────────────────────────────────────
/**
 * Backend proxy endpoint that forwards to your AI provider (Anthropic, OpenAI, etc.).
 * Do NOT call Anthropic directly from the browser in production — route through
 * a server-side proxy to protect your API key.
 *
 * For local dev: run a simple Express proxy on localhost:3001.
 * Leave empty to fall back to the built-in mock responses.
 */
export const AI_ENDPOINT = import.meta.env.VITE_AI_ENDPOINT || ''

/** Socket.io server URL for real-time messaging */
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || ''
