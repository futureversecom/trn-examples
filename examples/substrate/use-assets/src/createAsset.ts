import { createKeyring } from "@trne/utils/createKeyring";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getChainApi } from "@trne/utils/getChainApi";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
  CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

export async function main() {
  const api = await getChainApi("porcini");
  const caller = createKeyring(env.CALLER_PRIVATE_KEY);

  const minBalance = 1;
  const admin = caller.address;
  const assetId = (await api.query.assetsExt.nextAssetId()).toString();

  const createExtrinsic = api.tx.assets.create(
    assetId, //   The identifier of the new asset.
    //            This must not be currently in use to identify an existing asset
    admin, // 	   The admin of this class of assets. The admin is the initial address of each
    //            member of the asset class's admin team
    minBalance // The minimum balance of this new asset that any single account must
    ///           have. If an account's balance is reduced below this, then it collapses to zero
  );

  const { result: createExtrinsicResult } = await sendExtrinsic(
    createExtrinsic,
    caller,
    {
      log: console,
    }
  );
  const [createExtrinsicEvent] = filterExtrinsicEvents(
    createExtrinsicResult.events,
    ["Assets.Created"]
  );

  console.log("Create Extrinsic Result", createExtrinsicEvent.toJSON());

  const decimals = 6;
  const symbol = "MTK";
  const name = "My Token";

  const setMetadataExtrinsic = api.tx.assets.setMetadata(
    assetId, // The identifier of the asset to update
    name, //    The user friendly name of this asset
    symbol, //  The exchange symbol for this asset
    decimals // The number of decimals this asset uses to represent one unit
  );

  const { result: setMetadataResult } = await sendExtrinsic(
    setMetadataExtrinsic,
    caller,
    {
      log: console,
    }
  );
  const [setMetadataEvent] = filterExtrinsicEvents(setMetadataResult.events, [
    "Assets.Created",
  ]);

  console.log("Create Extrinsic Result", setMetadataEvent.toJSON());

  await api.disconnect();
}

main();
