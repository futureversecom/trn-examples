/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Signer } from "@trne/utils/createKeyring";
import { fetchTRNEvent } from "@trne/utils/fetchTRNEvent";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import type { ApiPromise } from "@trne/utils/getChainApi";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import { cleanEnv, str } from "envalid";
import { BigNumber, utils as ethers, getDefaultProvider, Wallet } from "ethers";

import { getBridgeContracts } from "../contracts";

const env = cleanEnv(process.env, {
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

const EthAsset = {
	decimals: 18,
	assetId: 1124,
};

async function main(api: ApiPromise, caller: Signer) {
	const provider = getDefaultProvider("goerli");
	const wallet = new Wallet(env.CALLER_PRIVATE_KEY, provider);
	const { bridgeContract } = getBridgeContracts("goerli", wallet);

	// Bridge requires a small fee
	let bridgeFee: BigNumber | undefined;
	// This can fail when using `defaultProvider`
	try {
		bridgeFee = await bridgeContract.bridgeFee();
	} catch (error: any) {
		// Error code associated with `defaultProvider` failure
		if (error?.code === "CALL_EXCEPTION") await main(api, caller);
		return;
	}

	// Submit withdraw extrinsic on The Root Network
	const assetId = EthAsset.assetId;
	const destination = wallet.address;
	const amount = ethers.parseUnits("0.01", EthAsset.decimals).toString();

	const extrinsic = api.tx.erc20Peg.withdraw(assetId, amount, destination);

	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [event] = filterExtrinsicEvents(result.events, ["Erc20Peg.Erc20Withdraw"]);

	console.log("Extrinsic ID", extrinsicId);
	console.log("Extrinsic Result", event.toJSON());
	await api.disconnect();

	// Submit claim transaction on Ethereum
	const {
		eventId,
		eventInfo: { source, destination: eventDestination, message },
		eventSignature: signature,
		eventAuthSetId: { setId: validatorSetId, setValue: validators },
	} = await fetchTRNEvent("porcini", extrinsicId);

	const args = [
		source,
		eventDestination,
		message,
		{
			eventId,
			validators,
			validatorSetId,
			...signature,
		},
	];
	const value = bridgeFee;

	const gasLimit = await bridgeContract.estimateGas.receiveMessage(...args, {
		value,
	});
	const tx = await bridgeContract.receiveMessage(
		source,
		destination,
		message,
		{ eventId, validators, validatorSetId, ...signature },
		{
			value,
			gasLimit,
		}
	);

	const receipt = await tx.wait();
	console.log("Claimed", receipt.transactionHash);

	process.exit(0);
}

withChainApi("porcini", main);
