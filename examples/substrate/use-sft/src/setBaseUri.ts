import assert from "assert";
import { collectArgs } from "@trne/utils/collectArgs";
import { createKeyring } from "@trne/utils/createKeyring";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getChainApi } from "@trne/utils/getChainApi";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { cleanEnv, str } from "envalid";
import { stringToHex } from "@polkadot/util";

const argv = collectArgs();

const env = cleanEnv(process.env, {
  CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

export async function main() {
  assert("collectionId" in argv, "Collection ID is required");

  const api = await getChainApi("porcini");
  const caller = createKeyring(env.CALLER_PRIVATE_KEY);

  const metadataScheme = stringToHex("https://example.com/token/");
  const { collectionId } = argv as unknown as { collectionId: number };

  const extrinsic = api.tx.sft.setBaseUri(collectionId, metadataScheme);

  const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
  const [event] = filterExtrinsicEvents(result.events, ["Sft.BaseUriSet"]);

  console.log("Extrinsic Result", event.toJSON());

  await api.disconnect();
}

main();
