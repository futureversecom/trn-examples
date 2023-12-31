import { ALICE, BOB, CHARLIE } from "@trne/utils/accounts";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { ASTO_ASSET_ID, XRP_ASSET_ID } from "@trne/utils/porcini-assets";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

interface AmountsIn {
	Ok: [number, number];
}

/**
 * Use `feeProxy.callWithFeePreferences` to trigger `utility.batchAll` call, which contain multiple
 * calls of `assets.trafer`, and pay gas in ASTO token.
 *
 * Assumes the caller has ASTO balance.
 */
withChainApi("porcini", async (api, caller, logger) => {
	/**
	 * 1. Create `utility.batchAll` call that batches 3 transfer calls to ALICE, BOB & CHARLIE
	 */
	const oneASTO = 1 * Math.pow(10, 18); // 1 ASTO in `wei` unit
	const transferToAliceCall = api.tx.assets.transfer(ASTO_ASSET_ID, ALICE, oneASTO.toString());
	const transferToBobCall = api.tx.assets.transfer(ASTO_ASSET_ID, BOB, oneASTO.toString());
	const transferToCharlieCall = api.tx.assets.transfer(ASTO_ASSET_ID, CHARLIE, oneASTO.toString());

	logger.info(
		{
			parameters: [
				transferToAliceCall.toJSON(),
				transferToBobCall.toJSON(),
				transferToCharlieCall.toJSON(),
			],
		},
		`create a "system.remarkWithEvent"`
	);
	const batchAllCall = api.tx.utility.batchAll([
		transferToAliceCall,
		transferToBobCall,
		transferToCharlieCall,
	]);

	/**
	 * 2. Determine the `maxPayment` in ASTO by estimate the gas cost and use `dex` to get a quote
	 */
	// we need a dummy feeProxy call (with maxPayment=0) to do a proper fee estimation
	const feeProxyCallForEstimation = api.tx.feeProxy.callWithFeePreferences(
		ASTO_ASSET_ID,
		0,
		batchAllCall
	);

	const paymentInfo = await feeProxyCallForEstimation.paymentInfo(caller.address);
	const estimatedFee = paymentInfo.partialFee.toString();

	// query the the `dex` to determine the `maxPayment` you are willing to pay
	const {
		Ok: [amountIn],
	} = (await api.rpc.dex.getAmountsIn(estimatedFee, [
		ASTO_ASSET_ID,
		XRP_ASSET_ID,
	])) as unknown as AmountsIn;

	// allow a buffer to avoid slippage, 5%
	const maxPayment = Number(amountIn * 1.05).toFixed();

	/**
	 * 3. Create and dispatch `feeProxy.callWithFeePreferences` extrinsic
	 */
	logger.info(
		{
			parameters: {
				paymentAsset: ASTO_ASSET_ID,
				maxPayment,
				call: batchAllCall.toJSON(),
			},
		},
		`create a "feeProxy.callWithFeePreferences"`
	);
	const feeProxyCall = api.tx.feeProxy.callWithFeePreferences(
		ASTO_ASSET_ID,
		maxPayment,
		batchAllCall
	);

	logger.info(`dispatch extrinsic from caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(feeProxyCall, caller, { log: logger });
	const [proxyEvent, batchEvent, aliceTransferEvent, bobTransferEvent, charlieTransferEvent] =
		filterExtrinsicEvents(result.events, [
			"FeeProxy.CallWithFeePreferences",
			"Utility.BatchCompleted",
			{ name: "Assets.Transferred", key: "to", data: { value: ALICE, type: "T::AccountId" } },
			{ name: "Assets.Transferred", key: "to", data: { value: BOB, type: "T::AccountId" } },
			{ name: "Assets.Transferred", key: "to", data: { value: CHARLIE, type: "T::AccountId" } },
		]);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				proxyEvent: formatEventData(proxyEvent.event),
				batchEvent: formatEventData(batchEvent.event),
				aliceTransferEvent: formatEventData(aliceTransferEvent.event),
				bobTransferEvent: formatEventData(bobTransferEvent.event),
				charlieTransferEvent: formatEventData(charlieTransferEvent.event),
			},
		},
		"receive result"
	);
});
