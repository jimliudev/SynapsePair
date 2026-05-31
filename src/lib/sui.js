/**
 * Sui transaction builders for SynapsePair on-chain actions.
 * Uses @mysten/sui v2.x Transaction PTB API.
 */
import { Transaction } from '@mysten/sui/transactions'
import { PACKAGE_ID, MODULE_NAME } from '../config'

const CLOCK = '0x6' // Shared Clock object (same address on all Sui networks)

function encodeVecU8(str) {
  return Array.from(new TextEncoder().encode(str))
}

// ─── Subscribe ─────────────────────────────────────────────────────────────────

/**
 * Build a PTB that calls synapse_pair::subscribe.
 * Splits `priceInMist` MIST from gas coin as payment.
 *
 * @param {number} skillId  - numeric skill ID
 * @param {string} skillName
 * @param {number} priceInMist - e.g. skill.price * 1_000_000 (testnet symbolic)
 */
export function buildSubscribeTx(skillId, skillName, priceInMist) {
  const tx = new Transaction()
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(priceInMist)])
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::subscribe`,
    arguments: [
      tx.pure('vector<u8>', encodeVecU8(String(skillId))), // skill_id as u64
      tx.pure('vector<u8>', encodeVecU8(skillName)),
      coin,
      tx.object(CLOCK),
    ],
    // Override u64 type for skill_id
    typeArguments: [],
  })
  return tx
}

/**
 * Build a PTB that calls synapse_pair::subscribe with proper u64 skill_id.
 */
export function buildSubscribeTxV2(skillId, skillName, priceInMist) {
  const tx = new Transaction()
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(priceInMist)])
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::subscribe`,
    arguments: [
      tx.pure.u64(skillId),
      tx.pure('vector<u8>', encodeVecU8(skillName)),
      coin,
      tx.object(CLOCK),
    ],
  })
  return tx
}

// ─── Create Room ───────────────────────────────────────────────────────────────

/**
 * Build a PTB that calls synapse_pair::create_room.
 *
 * @param {string} name     - Display name
 * @param {string} slug     - URL slug (lowercase, no spaces)
 * @param {boolean} isPublic
 */
export function buildCreateRoomTx(name, slug, isPublic) {
  const tx = new Transaction()
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::create_room`,
    arguments: [
      tx.pure('vector<u8>', encodeVecU8(name)),
      tx.pure('vector<u8>', encodeVecU8(slug)),
      tx.pure.bool(isPublic),
      tx.object(CLOCK),
    ],
  })
  return tx
}

// ─── Publish Skill ─────────────────────────────────────────────────────────────

/**
 * Build a PTB that calls synapse_pair::publish_skill.
 * Full skill metadata must already be uploaded to Walrus; pass the blob_id here.
 *
 * @param {number} skillId      - Unique numeric ID for this skill
 * @param {number} priceInMist  - Subscription price in MIST
 * @param {string} blobId       - Walrus blob ID containing the skill JSON
 */
export function buildPublishSkillTx(skillId, priceInMist, blobId) {
  const tx = new Transaction()
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::publish_skill`,
    arguments: [
      tx.pure.u64(skillId),
      tx.pure.u64(priceInMist),
      tx.pure('vector<u8>', encodeVecU8(blobId)),
      tx.object(CLOCK),
    ],
  })
  return tx
}
