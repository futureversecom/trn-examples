import { collectArgs } from "@trne/utils/collectArgs";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import assert from "assert";

const argv = collectArgs();
assert("listingId" in argv, "Listing ID is required");

withChainApi("porcini", async (api, caller) => {
	const { listingId } = argv as unknown as {
		listingId: number;
	};
	const extrinsic = api.tx.marketplace.buy(listingId);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [event] = filterExtrinsicEvents(result.events, ["Nft.FixedPriceSaleComplete"]);

	console.log("Extrinsic Result", event.toJSON());
});
