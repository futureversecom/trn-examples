import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { ASTO_ASSET_ID, XRP_ASSET_ID } from "@trne/utils/porcini-assets";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

interface Liquidity {
	0: number;
	1: number;
}

/**
 * Use `dex.addLiquidity` to add more liquidity for existing pair [XRP, ASTO], following the
 * existing ratio between the 2 tokens
 *
 * Assumes caller has ASTO for liquidity and XRP for both gas and liquidity.
 */
withChainApi("porcini", async (api, caller, logger) => {
	const tokenA = XRP_ASSET_ID;
	const tokenB = ASTO_ASSET_ID;

	// 💡 use `api.rpc.dex.getLiquidity` to get current ratio
	const liquidity = (await api.rpc.dex.getLiquidity(tokenA, tokenB)) as unknown as Liquidity;

	const tokenALiquidity = BigInt(liquidity["0"]);
	const tokenBLiquidity = BigInt(liquidity["1"]);

	const amountADesired = BigInt(1_000_000); // 1 XRP
	const amountBDesired = (amountADesired * tokenBLiquidity) / tokenALiquidity;

	const amountAMin = (amountADesired * BigInt(95)) / BigInt(100); // 5% slippage
	const amountBMin = (amountBDesired * BigInt(95)) / BigInt(100); // 5% slippage

	logger.info(
		{
			parameters: {
				tokenA,
				tokenB,
				amountADesired,
				amountBDesired,
				amountAMin,
				amountBMin,
			},
		},
		`create a "dex.addLiquidity" extrinsic`
	);

	const extrinsic = api.tx.dex.addLiquidity(
		tokenA,
		tokenB,
		amountADesired.toString(),
		amountBDesired.toString(),
		amountAMin.toString(),
		amountBMin.toString(),
		null, // to
		null // deadline
	);

	logger.info(`dispatch extrinsic from caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	const [addEvent] = filterExtrinsicEvents(result.events, ["Dex.AddLiquidity"]);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				addEvent: formatEventData(addEvent.event),
			},
		},
		"receive result"
	);
});
