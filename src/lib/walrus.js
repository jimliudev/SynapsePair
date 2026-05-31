/**
 * Walrus testnet storage — publisher mode.
 *
 * The publisher node pays WAL on behalf of the user, so no wallet interaction
 * is required for uploads. The user gets back a blobId they can use to read
 * the file from any aggregator node.
 *
 * Extracted from WalrusPulse (publisher-only subset).
 */
import { WALRUS_PUBLISHER, WALRUS_AGGREGATOR, WALRUS_EPOCHS } from '../config'

// ─── Upload ────────────────────────────────────────────────────────────────────

/**
 * Upload data to Walrus testnet and return the blob ID.
 * Accepts File, Blob, string, or plain object (JSON-serialised automatically).
 */
export async function storeBlob(data) {
  let body, contentType

  if (data instanceof File || data instanceof Blob) {
    body = data
    contentType = data.type || 'application/octet-stream'
  } else if (typeof data === 'string') {
    body = new Blob([data], { type: 'text/plain' })
    contentType = 'text/plain'
  } else {
    body = new Blob([JSON.stringify(data)], { type: 'application/json' })
    contentType = 'application/json'
  }

  const url = `${WALRUS_PUBLISHER}/v1/blobs?epochs=${WALRUS_EPOCHS}`
  const response = await fetch(url, {
    method: 'PUT',
    body,
    headers: { 'Content-Type': contentType },
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => response.statusText)
    throw new Error(`Walrus upload failed (${response.status}): ${errText}`)
  }

  const result = await response.json()

  if (result.newlyCreated?.blobObject?.blobId) {
    return result.newlyCreated.blobObject.blobId
  }
  if (result.alreadyCertified?.blobId) {
    return result.alreadyCertified.blobId
  }

  throw new Error('Unexpected Walrus response: ' + JSON.stringify(result))
}

// ─── Read ──────────────────────────────────────────────────────────────────────

/** Returns the public aggregator URL for a given blob ID. */
export function getBlobUrl(blobId) {
  return `${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`
}

/** Download and parse a blob. Returns parsed JSON or raw string. */
export async function readBlob(blobId) {
  const response = await fetch(getBlobUrl(blobId))
  if (!response.ok) throw new Error(`Walrus read failed (${response.status})`)
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
