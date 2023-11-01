import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { ASTO_ASSET_ID, XRP_ASSET_ID } from "@trne/utils/porcini-assets";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import assert from "node:assert";

interface LiquidityToken {
	Ok: number;
}

withChainApi("porcini", async (api, caller, logger) => {
	const tokenA = XRP_ASSET_ID;
	const tokenB = ASTO_ASSET_ID;

	const lpAssetId = (await api.rpc.dex.getLPTokenID(tokenA, tokenB)) as unknown as LiquidityToken;
	const liquidity = await api.query.assets.account(lpAssetId.Ok, caller.address);
	assert(liquidity.isSome);

	logger.info(
		{
			liquidityBalance: {
				lpAssetId: lpAssetId.Ok,
				liquidity,
			},
		},
		`${caller.address} liquidity balance`
	);

	const amountAMin = 0;
	const amountBMin = 0;

	logger.info(
		{
			parameters: {
				tokenA,
				tokenB,
				liquidity: liquidity.unwrap().balance.toString(),
				amountAMin,
				amountBMin,
			},
		},
		`create a "futurepass.proxyExtrinsic" extrinsic`
	);
	const extrinsic = api.tx.dex.removeLiquidity(
		tokenA,
		tokenB,
		liquidity.unwrap().balance,
		amountAMin,
		amountBMin,
		null, // to
		null // deadline
	);

	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	const [removeEvent] = filterExtrinsicEvents(result.events, ["Dex.RemoveLiquidity"]);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				removeEvent: formatEventData(removeEvent.event),
			},
		},
		"receive result"
	);
});
