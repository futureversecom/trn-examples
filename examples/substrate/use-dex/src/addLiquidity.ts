/* eslint-disable @typescript-eslint/no-explicit-any */
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

const XrpAssetId = 2;
const RootAssetId = 1;

withChainApi("porcini", async (api, caller) => {
	const tokenA = RootAssetId;
	const tokenB = XrpAssetId;
	const amountADesired = 10_000_000;
	const amountBDesired = 10_000_000;
	const amountAMin = 0;

	// querying the dex for quote, to determine the `amountBMin` you are willing to accept
	const { 0: tokenALiquidity, 1: tokenBLiquidity } = (
		await (api.rpc as any).dex.getLiquidity(tokenA, tokenB)
	).toJSON();
	const { Ok: amountBMin } = (
		await (api.rpc as any).dex.quote(amountADesired, tokenALiquidity, tokenBLiquidity)
	).toJSON();

	const extrinsic = api.tx.dex.addLiquidity(
		tokenA,
		tokenB,
		amountADesired,
		amountBDesired,
		amountAMin,
		amountBMin,
		null, // to
		null // deadline
	);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	// depending on what extrinsic call you have, filter out the right event here
	const [event] = filterExtrinsicEvents(result.events, ["Dex.AddLiquidity"]);

	console.log("Extrinsic Result", event.toJSON());

	const {
		event: { data },
	} = event;
	const liquidity = data[5].toString();
	console.log("Liquidity", liquidity);
});
