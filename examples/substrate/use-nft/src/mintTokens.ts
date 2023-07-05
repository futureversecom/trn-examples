import { createKeyring } from "@trne/utils/createKeyring";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getChainApi } from "@trne/utils/getChainApi";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
	NFT_COLLECTION_ID: str(),
});

export async function main() {
	const api = await getChainApi("porcini");
	const caller = createKeyring(env.CALLER_PRIVATE_KEY);
	const quantity = 10;
	const extrinsic = api.tx.nft.mint(
		env.NFT_COLLECTION_ID,
		quantity,
		caller.address
	);

	console.info(`Mint ${quantity} nfts for ${caller.address}`);
	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [event] = filterExtrinsicEvents(result.events, ["Nft.Mint"]);

	console.log("Extrinsic Result", event.toJSON());

	await api.disconnect();
}

main();
