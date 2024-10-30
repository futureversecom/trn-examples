import { u8aToHex } from "@polkadot/util";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

// Sign multisig proxy extrinsic by second holder, update the env CALLER_PRIVATE_KEY to second holders
// MultiSig wallet used is 0xe944FAd69B79125706D2481f58b66fcDbED358d7
withChainApi("porcini", async (api, caller, logger) => {
	console.log("signer.address:", caller.address);

	const xrp = 2;
	const amount = 100;
	const randomAccount = "0xd094275a3eb8D3300faD74370a71633CfedDCA99";
	// Extrinsic to be used for multi signature call
	const extrinsic = api.tx.assets.transfer(xrp, randomAccount, amount);
	const u8a = extrinsic.method.toU8a();
	const encodedCallData = u8aToHex(u8a);

	// Update the signatoryList with the other two multisig wallet addresses
	const signatoryList = [
		"0x6D1eFDE1BbF146EF88c360AF255D9d54A5D39408",
		"0xFFfFffFF000000000000000000000000000003CD",
	];

	const multiSigWallet = "0xe944FAd69B79125706D2481f58b66fcDbED358d7";
	console.log("signatoryList::", signatoryList);
	const threshold = signatoryList.length;
	let timepoint = {};
	const allEntries = await api.query.multisig.multisigs.entries(multiSigWallet);
	allEntries.forEach(
		([
			{
				args: [accountId],
			},
			value,
		]) => {
			const time = JSON.parse(value);
			timepoint = time.when;
		}
	);
	const maybeTimepoint = api.registry.createType("Option<Timepoint>", timepoint);
	const proofSize = 882400098;
	console.log("maybeTimepointData::", maybeTimepoint.toHuman());
	const maxWeight = api.registry.createType("SpWeightsWeightV2Weight", {refTime: 646755879000, proofSize });
	const multiSigCall = await api.tx.multisig.asMulti(
		threshold,
		signatoryList,
		maybeTimepoint,
		encodedCallData,
		maxWeight
	);

	const { result, extrinsicId } = await sendExtrinsic(multiSigCall, caller);
	console.log("Result:", result);
	console.log("Extrinsic id::", extrinsicId);
	const [assetTransferredEvent] = filterExtrinsicEvents(result.events, ["Assets.Transferred"]);
	if (assetTransferredEvent) {
		const data = assetTransferredEvent.event.data;
		console.log("Transfer xrp successfully executed:::", data.toHuman());
	} else {
		console.log("Something wrong with multi sig signing...");
	}
});
