/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from "assert";
import { collectArgs } from "@trne/utils/collectArgs";
import { createKeyring } from "@trne/utils/createKeyring";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getChainApi } from "@trne/utils/getChainApi";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { cleanEnv, str } from "envalid";

const argv = collectArgs();

const env = cleanEnv(process.env, {
  CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

const XrpAssetId = 2;
const RootAssetId = 1;

export async function main() {
  assert("liquidity" in argv, "Liquidity is required");

  const api = await getChainApi("porcini");
  const caller = createKeyring(env.CALLER_PRIVATE_KEY);

  const tokenA = RootAssetId;
  const tokenB = XrpAssetId;
  const amountAMin = 0;
  const amountBMin = 0;

  const { liquidity } = argv as unknown as { liquidity: number };

  const extrinsic = api.tx.dex.removeLiquidity(
    tokenA,
    tokenB,
    liquidity,
    amountAMin,
    amountBMin,
    null, // to
    null // deadline
  );

  const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
  // depending on what extrinsic call you have, filter out the right event here
  const [event] = filterExtrinsicEvents(result.events, ["Dex.RemoveLiquidity"]);

  console.log("Extrinsic Result", event.toJSON());

  await api.disconnect();
}

main();
