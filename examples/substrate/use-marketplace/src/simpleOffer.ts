import assert from "assert";
import { collectArgs } from "@trne/utils/collectArgs";
import { createKeyring } from "@trne/utils/createKeyring";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getChainApi } from "@trne/utils/getChainApi";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { cleanEnv, str } from "envalid";
import { utils as ethers } from "ethers";

const argv = collectArgs();

const env = cleanEnv(process.env, {
  CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

const RootAsset = {
  assetId: 1,
  decimals: 6,
};

export async function main() {
  const { tokenId, marketplaceId } = formatArgs();

  const api = await getChainApi("porcini");
  const caller = createKeyring(env.CALLER_PRIVATE_KEY);

  const assetId = RootAsset.assetId;
  const amount = ethers.parseUnits("1", RootAsset.decimals).toString();

  const extrinsic = api.tx.marketplace.makeSimpleOffer(
    tokenId,
    amount,
    assetId,
    marketplaceId
  );

  const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
  const [event] = filterExtrinsicEvents(result.events, ["Nft.Offer"]);

  console.log("Extrinsic Result", event.toJSON());

  await api.disconnect();
}

main();

function formatArgs() {
  assert("tokenId" in argv, "Token ID is required");
  assert("marketplaceId" in argv, "Marketplace ID is required");

  const { tokenId, marketplaceId } = argv as unknown as {
    tokenId: number;
    marketplaceId: number;
  };

  return { tokenId, marketplaceId };
}
