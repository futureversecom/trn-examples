import {
	createDispatcher,
	filterExtrinsicEvents,
	nativeWalletSigner,
} from "@therootnetwork/extrinsic";
import { createKeyring } from "@trne/utils/createKeyring";
import { ASTO_ASSET_ID, XRP_ASSET_ID } from "@trne/utils/porcini-assets";
import { withChainContext } from "@trne/utils/withChainContext";
import { cleanEnv, str } from "envalid";
import assert from "node:assert";

interface LiquidityToken {
	Ok: number;
}

const { CHAIN_ENDPOINT, CALLER_PRIVATE_KEY } = cleanEnv(process.env, {
	CHAIN_ENDPOINT: str({ default: "porcini" }),
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

/**
 * Use `dex.removeLiquidity` to remove your own liqidity from the pair [XRP, ASTO]
 *
 * Assumes caller liquidity of the pair and XRP to pay gas.
 */
withChainContext(CHAIN_ENDPOINT, async (api, logger) => {
	const caller = createKeyring(CALLER_PRIVATE_KEY);
	const { estimate, signAndSend } = createDispatcher(
		api,
		caller.address,
		[],
		nativeWalletSigner(caller)
	);

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
		`create a "dex.removeLiquidity" extrinsic`
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

	const feeResult = await estimate(extrinsic);
	assert(feeResult.ok, (feeResult.value as Error).message);
	logger.info(
		{ parameters: { caller: caller.address, fee: feeResult.ok ? feeResult.value : undefined } },
		`dispatch extrinsic`
	);

	const result = await signAndSend(extrinsic, (status) => {
		logger.debug(status);
	});
	assert(result.ok, (result.value as Error).message);

	const { id, events } = result.value;
	const [transferEvent] = filterExtrinsicEvents(events, ["dex.RemoveLiquidity"]);
	assert(transferEvent);

	logger.info(
		{
			result: {
				extrinsicId: id,
				transferEvent,
			},
		},
		"dispatch result"
	);
});
