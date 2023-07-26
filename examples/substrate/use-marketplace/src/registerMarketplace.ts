import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

withChainApi("porcini", async (api, caller) => {
	const marketplaceAccount = caller.address;
	const entitlement = 10_000; // One percent

	const extrinsic = api.tx.marketplace.registerMarketplace(marketplaceAccount, entitlement);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [event] = filterExtrinsicEvents(result.events, ["Nft.MarketplaceRegister"]);

	console.log("Extrinsic Result", event.toJSON());

	const marketplaceId = (
		event.toJSON() as {
			event: {
				data: [string, number, number];
			};
		}
	).event.data[2];
	console.log("Marketplace ID", marketplaceId);
});
