import { ALICE, BOB, CHARLIE } from "@trne/utils/accounts";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

const ASTO_ASSET_ID = 17_508;
const XRP_ASSET_ID = 2;

interface AmountsIn {
	Ok: [number, number];
}

/**
 * Use `feeProxy.callWithFeePreferences` to trigger `utility.batchAll` call, which contain multiple
 * calls of `assets.trafer`, and pay gas in ASTO token.
 *
 * Assumes the caller has some ASTO balance.
 */
withChainApi("porcini", async (api, caller) => {
	const oneASTO = 1 * Math.pow(10, 18); // 1 ASTO in `wei` unit
	const transferToAliceCall = api.tx.assets.transfer(ASTO_ASSET_ID, ALICE, oneASTO.toString());
	const transferToBobCall = api.tx.assets.transfer(ASTO_ASSET_ID, BOB, oneASTO.toString());
	const transferToCharlieCall = api.tx.assets.transfer(ASTO_ASSET_ID, CHARLIE, oneASTO.toString());

	const batchAllCall = api.tx.utility.batchAll([
		transferToAliceCall,
		transferToBobCall,
		transferToCharlieCall,
	]);

	const paymentInfo = await batchAllCall.paymentInfo(caller.address);
	const estimatedFee = paymentInfo.partialFee.toString();

	// querying the dex for swap price, to determine the `maxPayment` you are willing to pay
	const {
		Ok: [amountIn],
	} = (await api.rpc.dex.getAmountsIn(estimatedFee, [
		ASTO_ASSET_ID,
		XRP_ASSET_ID,
	])) as unknown as AmountsIn;
	// allow a buffer to prevent extrinsic failure
	const maxPayment = Number(amountIn * 1.5).toFixed();

	const feeProxyCall = api.tx.feeProxy.callWithFeePreferences(
		ASTO_ASSET_ID,
		maxPayment,
		batchAllCall
	);

	const { result, extrinsicId } = await sendExtrinsic(feeProxyCall, caller, { log: console });
	const [proxyEvent, batchEvent, aliceTransferEvent, bobTransferEvent, charlieTransferEvent] =
		filterExtrinsicEvents(result.events, [
			"FeeProxy.CallWithFeePreferences",
			"Utility.BatchCompleted",
			{ name: "Assets.Transferred", key: "to", data: { value: ALICE, type: "T::AccountId" } },
			{ name: "Assets.Transferred", key: "to", data: { value: BOB, type: "T::AccountId" } },
			{ name: "Assets.Transferred", key: "to", data: { value: CHARLIE, type: "T::AccountId" } },
		]);

	console.log("Extrinsic ID:", extrinsicId);
	console.log("Extrinsic Result:", {
		proxy: formatEventData(proxyEvent.event),
		batchEvent: formatEventData(batchEvent.event),
		aliceTransferEvent: formatEventData(aliceTransferEvent.event),
		bobTransferEvent: formatEventData(bobTransferEvent.event),
		charlieTransferEvent: formatEventData(charlieTransferEvent.event),
	});
});
