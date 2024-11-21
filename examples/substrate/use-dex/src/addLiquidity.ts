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

interface Liquidity {
	0: number;
	1: number;
}

const { CHAIN_ENDPOINT, CALLER_PRIVATE_KEY } = cleanEnv(process.env, {
	CHAIN_ENDPOINT: str({ default: "porcini" }),
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

/**
 * Use `dex.addLiquidity` to add more liquidity for existing pair [XRP, ASTO], following the
 * existing ratio between the 2 tokens
 *
 * Assumes caller has ASTO for liquidity and XRP for both gas and liquidity.
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
	const [transferEvent] = filterExtrinsicEvents(events, ["dex.AddLiquidity"]);
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
