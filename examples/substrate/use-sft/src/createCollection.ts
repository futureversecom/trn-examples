import { createKeyring } from "@trne/utils/createKeyring";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getChainApi } from "@trne/utils/getChainApi";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { cleanEnv, str } from "envalid";
import { stringToHex } from "@polkadot/util";

const env = cleanEnv(process.env, {
  CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

export async function main() {
  const api = await getChainApi("porcini");
  const caller = createKeyring(env.CALLER_PRIVATE_KEY);

  const collectionName = "MyCollection";
  const collectionOwner = caller.address;
  const metadataScheme = stringToHex("https://example.com/metadata.json");
  const royaltiesSchedule = { entitlements: [[collectionOwner, 10_000]] };

  const extrinsic = api.tx.sft.createCollection(
    collectionName,
    collectionOwner,
    metadataScheme,
    royaltiesSchedule
  );

  const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
  const [event] = filterExtrinsicEvents(result.events, [
    "Sft.CollectionCreate",
  ]);

  console.log("Extrinsic Result", event.toJSON());

  const collectionId = (
    event.toJSON() as {
      event: {
        data: [number];
      };
    }
  ).event.data[0];
  console.log("Collection ID", collectionId);

  await api.disconnect();
}

main();
