import { createKeyring } from "@trne/utils/createKeyring";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getChainApi } from "@trne/utils/getChainApi";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { cleanEnv, str } from "envalid";
import { utils as ethers } from "ethers";

const env = cleanEnv(process.env, {
  CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

// Find token details at
// https://explorer.rootnet.cloud/tokens
const ASTO = {
  id: 17508,
  decimals: 18,
};

export async function main() {
  const api = await getChainApi("porcini");
  const caller = createKeyring(env.CALLER_PRIVATE_KEY);

  const assetId = ASTO.id;
  const target = "0x25451A4de12dcCc2D166922fA938E900fCc4ED24";
  const amount = ethers.parseUnits("100", ASTO.decimals).toString();

  const extrinsic = api.tx.assets.transfer(assetId, target, amount);

  const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
  const [event] = filterExtrinsicEvents(result.events, ["Assets.Transferred"]);

  console.log("Extrinsic Result", event.toJSON());

  await api.disconnect();
}

main();
