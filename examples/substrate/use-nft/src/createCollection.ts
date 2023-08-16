import { stringToHex } from "@polkadot/util";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

withChainApi("porcini", async (api, caller) => {
	const name = "MyToken";
	const initialIssuance = 1_000;
	const maxIssuance = 10_000;
	const tokenOwner = caller.address;
	const metadataScheme = stringToHex("https://example.com/token/");
	const royaltiesSchedule = {
		entitlements: [[tokenOwner, 10_000 /* one percent */]],
	};
	const crossChainCompatibility = false;

	const extrinsic = api.tx.nft.createCollection(
		name,
		initialIssuance,
		maxIssuance,
		tokenOwner,
		metadataScheme,
		royaltiesSchedule,
		crossChainCompatibility
	);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [event] = filterExtrinsicEvents(result.events, ["Nft.CollectionCreate"]);

	console.log("Extrinsic Result", event.toJSON());

	const collectionId = (
		event.toJSON() as {
			event: {
				data: [number];
			};
		}
	).event.data[0];
	console.log("Collection ID", collectionId);
});
