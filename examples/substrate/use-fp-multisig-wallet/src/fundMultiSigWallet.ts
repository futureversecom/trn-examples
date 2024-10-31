import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

export const command = "fundMultiSigWallet";
export const desc = "Fund a multisig wallet with xrp";

// Multi sig wallet used is 0xe944FAd69B79125706D2481f58b66fcDbED358d7
// Update the env CALLER_PRIVATE_KEY with funder account
withChainApi("porcini", async (api, caller, logger) => {
	const multiSigWallet = "0xe944FAd69B79125706D2481f58b66fcDbED358d7";

	const xrp = 2;
	const amount = 100000;
	const extrinsic = await api.tx.assets.transfer(xrp, multiSigWallet, amount);
	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	// const response = await submitExtrinsic(extrinsic, caller);
	console.log("Result:", result);
	console.log("Extrinsic id::", extrinsicId);
});
