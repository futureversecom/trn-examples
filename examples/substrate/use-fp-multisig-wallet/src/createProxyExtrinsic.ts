import { u8aToHex } from "@polkadot/util";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

export const command = "createProxyExtrinsic";
export const desc = "Create futurepass multisig proxy extrinsic";

withChainApi("porcini", async (api, caller, logger) => {
	console.log("signer.address:", caller.address);
	const fpassAccount = await api.query.futurepass.holders(caller.address);
	console.log("futurepass account:", fpassAccount.toString());
	const xrp = 2;
	const amount = 100;
	const randomAccount = "0xd094275a3eb8D3300faD74370a71633CfedDCA99";
	// Extrinsic to be used for multi signature call
	const extrinsic = api.tx.assets.transfer(xrp, randomAccount, amount);
	const u8a = extrinsic.method.toU8a();
	const encodedCallData = u8aToHex(u8a);

	const signatoryList = [
		"0x25451A4de12dcCc2D166922fA938E900fCc4ED24",
		"0x6D1eFDE1BbF146EF88c360AF255D9d54A5D39408",
	];
	console.log("signatoryList::", signatoryList);
	const threshold = signatoryList.length;
	const maybeTimepoint = null;
	const storeCall = false;
	const maxWeight = 0;

	const multiSigCall = await api.tx.multisig.asMulti(
		threshold,
		signatoryList,
		maybeTimepoint,
		encodedCallData,
		storeCall,
		maxWeight
	);
	const proxyExtrinsic = await api.tx.futurepass.proxyExtrinsic(fpassAccount, multiSigCall);

	const { result, extrinsicId } = await sendExtrinsic(proxyExtrinsic, caller, { log: logger });
	console.log("Result:", result);
	console.log("Extrinsic id::", extrinsicId);
	// const [proxyEvent, futurepassEvent] = filterExtrinsicEvents(result.events, [
	// 	"FeeProxy.CallWithFeePreferences",
	// 	"Futurepass.ProxyExecuted",
	// ]);
});
