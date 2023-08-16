import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import { utils as ethers } from "ethers";

// Find token details at
// https://explorer.rootnet.cloud/tokens
const ASTO = {
	id: 17508,
	decimals: 18,
};

withChainApi("porcini", async (api, caller) => {
	const assetId = ASTO.id;
	const target = "0x25451A4de12dcCc2D166922fA938E900fCc4ED24";
	const amount = ethers.parseUnits("100", ASTO.decimals).toString();

	const extrinsic = api.tx.assets.transfer(assetId, target, amount);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [event] = filterExtrinsicEvents(result.events, ["Assets.Transferred"]);

	console.log("Extrinsic Result", event.toJSON());
});
