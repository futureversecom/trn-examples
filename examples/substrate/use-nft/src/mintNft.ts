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

export async function main() {
  if (!("collectionId" in argv))
    return console.log("Collection ID is required");

  const api = await getChainApi("porcini");
  const caller = createKeyring(env.CALLER_PRIVATE_KEY);

  const quantity = 10;
  const tokenOwner = caller.address;
  const { collectionId } = argv as unknown as { collectionId: number };

  const extrinsic = api.tx.nft.mint(collectionId, quantity, tokenOwner);

  const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
  const [event] = filterExtrinsicEvents(result.events, ["Nft.Mint"]);

  console.log("Extrinsic Result", event.toJSON());

  await api.disconnect();
}

main();
