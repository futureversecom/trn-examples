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

  const marketplaceAccount = caller.address;
  const entitlement = 10_000; // One percent

  const extrinsic = api.tx.marketplace.registerMarketplace(
    marketplaceAccount,
    entitlement
  );

  const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
  const [event] = filterExtrinsicEvents(result.events, [
    "Nft.MarketplaceRegister",
  ]);

  console.log("Extrinsic Result", event.toJSON());

  const marketplaceId = (
    event.toJSON() as {
      event: {
        data: [string, number, number];
      };
    }
  ).event.data[2];
  console.log("Marketplace ID", marketplaceId);

  await api.disconnect();
}

main();
