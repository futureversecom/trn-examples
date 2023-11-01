import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { ASTO_ASSET_ID, XRP_ASSET_ID } from "@trne/utils/porcini-assets";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

interface AmountsOut {
	Ok: [number, number];
}

/**
 * Use `dex.swapWithExactSupply` to swap XRP for ASTO, with exact amount in.
 *
 * Similar swap called can be used is `dex.swapWithExactTarget` to swap token with exact amount out.
 *
 * Assumes caller has XRP to pay for gas and to swap for ASTO.
 */
withChainApi("porcini", async (api, caller, logger) => {
	const tokenA = XRP_ASSET_ID;
	const tokenB = ASTO_ASSET_ID;
	const oneXrp = 1_000_000;
	// use `dex.getAmountsOut` to determin the minimum amount of ASTO from 1 XRP
	const {
		Ok: [amountIn, amountOut],
	} = (await api.rpc.dex.getAmountsOut(oneXrp, [tokenA, tokenB])) as unknown as AmountsOut;

	const amountOutMin = amountOut * 0.95; // 5% slippage

	logger.info(
		{
			parameters: {
				amountIn,
				amountOutMin,
				path: [tokenA, tokenB],
			},
		},
		`create a "dex.swapWithExactSupply" extrinsic`
	);
	const extrinsic = api.tx.dex.swapWithExactSupply(
		amountIn.toString(),
		amountOutMin.toString(),
		[tokenA, tokenB],
		null, // to
		null // deadline
	);

	logger.info(`dispatch extrinsic from caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	const [swapEvent] = filterExtrinsicEvents(result.events, ["Dex.Swap"]);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				swapEvent: formatEventData(swapEvent.event),
			},
		},
		"receive result"
	);
});
