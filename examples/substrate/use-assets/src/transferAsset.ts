import { createKeyring } from "@trne/utils/createKeyring";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getChainApi } from "@trne/utils/getChainApi";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { cleanEnv, str } from "envalid";
import { formatUnits } from "ethers";

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

  const target = "0x25451A4de12dcCc2D166922fA938E900fCc4ED24";
  const extrinsic = api.tx.assets.transfer(
    ASTO.id, // 			               Asset ID to transfer
    target, // 				            Recipient address
    formatUnits(100, ASTO.decimals) // Amount to transfer
  );

  const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
  const [event] = filterExtrinsicEvents(result.events, ["Assets.Transferred"]);

  console.log("Extrinsic Result", event.toJSON());

  await api.disconnect();
}

main();
