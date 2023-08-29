import { collectArgs } from "@trne/utils/collectArgs";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import assert from "assert";

const argv = collectArgs();
assert("liquidity" in argv, "Liquidity is required");

const XrpAssetId = 2;
const RootAssetId = 1;

withChainApi("porcini", async (api, caller) => {
	const tokenA = RootAssetId;
	const tokenB = XrpAssetId;
	const amountAMin = 0;
	const amountBMin = 0;

	const { liquidity } = argv as unknown as { liquidity: number };

	const extrinsic = api.tx.dex.removeLiquidity(
		tokenA,
		tokenB,
		liquidity,
		amountAMin,
		amountBMin,
		null, // to
		null // deadline
	);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	// depending on what extrinsic call you have, filter out the right event here
	const [event] = filterExtrinsicEvents(result.events, ["Dex.RemoveLiquidity"]);

	console.log("Extrinsic Result", event.toJSON());
});
