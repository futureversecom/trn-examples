import { createKeyring } from "@trne/utils/createKeyring";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getChainApi } from "@trne/utils/getChainApi";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
  CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

const XrpAssetId = 2;
const RootAssetId = 1;

export async function main() {
  const api = await getChainApi("porcini");
  const caller = createKeyring(env.CALLER_PRIVATE_KEY);

  const oneXrp = 1_000_000;

  // querying the dex for swap price, to determine the `amountOutMin` you are willing to accept
  const {
    Ok: [amountIn, amountOutMin],
  } = (
    await // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (api.rpc as any).dex.getAmountsOut(oneXrp, [XrpAssetId, RootAssetId])
  ).toJSON();

  const extrinsic = api.tx.dex.swapWithExactSupply(
    amountIn,
    amountOutMin,
    [XrpAssetId, RootAssetId],
    null, // to
    null // deadline
  );

  const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
  // depending on what extrinsic call you have, filter out the right event here
  const [event] = filterExtrinsicEvents(result.events, ["Dex.Swap"]);

  console.log("Extrinsic Result", event.toJSON());

  await api.disconnect();
}

main();
