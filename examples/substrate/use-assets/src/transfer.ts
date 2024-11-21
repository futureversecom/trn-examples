import {
	createDispatcher,
	filterExtrinsicEvents,
	nativeWalletSigner,
} from "@therootnetwork/extrinsic";
import { createKeyring } from "@trne/utils/createKeyring";
import { ASTO_ASSET_ID } from "@trne/utils/porcini-assets";
import { withChainContext } from "@trne/utils/withChainContext";
import { cleanEnv, str } from "envalid";
import assert from "node:assert";

const { CHAIN_ENDPOINT, CALLER_PRIVATE_KEY } = cleanEnv(process.env, {
	CHAIN_ENDPOINT: str({ default: "porcini" }),
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

/**
 * Use `assets.transfer` to transfer 0.1 ASTO from caller address to itself
 *
 * Assumes caller has ASTO and XRP for transfer and gas.
 */
withChainContext(CHAIN_ENDPOINT, async (api, logger) => {
	const caller = createKeyring(CALLER_PRIVATE_KEY);
	const { estimate, signAndSend } = createDispatcher(
		api,
		caller.address,
		[],
		nativeWalletSigner(caller)
	);

	const assetId = ASTO_ASSET_ID;
	const target = caller.address;
	const amount = 0.1 * Math.pow(10, 18); // 0.1 ASTO

	logger.info(
		{
			parameters: {
				assetId,
				target,
				amount,
			},
		},
		`create a "assets.transfer" extrinsic`
	);
	const extrinsic = api.tx.asset.transfer(assetId, target, amount.toString());
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
	const [transferEvent] = filterExtrinsicEvents(events, ["assets.Transferred"]);
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
