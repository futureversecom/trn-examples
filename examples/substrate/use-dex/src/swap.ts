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

interface AmountsOut {
	Ok: [number, number];
}

const { CHAIN_ENDPOINT, CALLER_PRIVATE_KEY } = cleanEnv(process.env, {
	CHAIN_ENDPOINT: str({ default: "porcini" }),
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

/**
 * Use `dex.swapWithExactSupply` to swap XRP for ASTO, with exact amount in.
 *
 * Similar swap called can be used is `dex.swapWithExactTarget` to swap token with exact amount out.
 *
 * Assumes caller has XRP to pay for gas and to swap for ASTO.
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
	const [transferEvent] = filterExtrinsicEvents(events, ["dex.Swap"]);
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
