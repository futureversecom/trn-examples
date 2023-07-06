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

export async function main() {
  assert("tokenId" in argv, "Token ID is required");
  assert("collectionId" in argv, "Collection ID is required");

  const api = await getChainApi("porcini");
  const caller = createKeyring(env.CALLER_PRIVATE_KEY);

  const { tokenId } = argv as unknown as { tokenId: number };
  const { collectionId } = argv as unknown as { collectionId: number };

  const tokenOwner = caller.address;
  const serialNumbers = [[tokenId, 10]];

  const extrinsic = api.tx.sft.mint(collectionId, serialNumbers, tokenOwner);

  const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
  const [event] = filterExtrinsicEvents(result.events, ["Sft.Mint"]);

  console.log("Extrinsic Result", event.toJSON());

  await api.disconnect();
}

main();
