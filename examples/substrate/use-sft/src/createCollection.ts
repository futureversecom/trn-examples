import { stringToHex } from "@polkadot/util";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

withChainApi("porcini", async (api, caller) => {
	const collectionName = "MyCollection";
	const collectionOwner = caller.address;
	const metadataScheme = stringToHex("https://example.com/token/");
	const royaltiesSchedule = {
		entitlements: [[collectionOwner, 10_000 /* one percent */]],
	};

	const extrinsic = api.tx.sft.createCollection(
		collectionName,
		collectionOwner,
		metadataScheme,
		royaltiesSchedule
	);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [event] = filterExtrinsicEvents(result.events, ["Sft.CollectionCreate"]);

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
