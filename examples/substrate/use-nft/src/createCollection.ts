import { stringToHex } from "@polkadot/util";
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

	await api.disconnect();
}

main();
