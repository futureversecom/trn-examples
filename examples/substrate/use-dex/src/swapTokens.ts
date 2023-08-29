import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

const XrpAssetId = 2;
const RootAssetId = 1;

interface AmountsOut {
	Ok: [number, number];
}

withChainApi("porcini", async (api, caller) => {
	const oneXrp = 1_000_000;

	// querying the dex for swap price, to determine the `amountOutMin` you are willing to accept
	const {
		Ok: [amountIn, amountOutMin],
	} = (await api.rpc.dex.getAmountsOut(oneXrp, [XrpAssetId, RootAssetId])) as unknown as AmountsOut;

	const extrinsic = api.tx.dex.swapWithExactSupply(
		amountIn,
		amountOutMin,
		[XrpAssetId, RootAssetId],
		null, // to
		null // deadline
	);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	// depending on what extrinsic call you have, filter out the right event here
	const [event] = filterExtrinsicEvents(result.events, ["Dex.Swap"]);

	console.log("Extrinsic Result", event.toJSON());
});
