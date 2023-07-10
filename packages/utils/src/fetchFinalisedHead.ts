import type { ApiPromise } from "@polkadot/api";

/**
 * Fetch the current finalised block height
 * @param api Instance of ApiPromise
 * @returns Block height
 */
export async function fetchFinalisedHead(api: ApiPromise): Promise<number> {
  const blockHash = await api.rpc.chain.getFinalizedHead();
  const { block } = await api.rpc.chain.getBlock(blockHash);
  return block.header.number.toNumber();
}
