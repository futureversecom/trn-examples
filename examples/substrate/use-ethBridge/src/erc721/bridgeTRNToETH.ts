import { collectArgs } from "@trne/utils/collectArgs";
import { createKeyring } from "@trne/utils/createKeyring";
import { fetchTRNEvent } from "@trne/utils/fetchTRNEvent";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getChainApi } from "@trne/utils/getChainApi";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import assert from "assert";
import { cleanEnv, str } from "envalid";
import { getDefaultProvider, Wallet } from "ethers";

import { getBridgeContracts } from "../contracts";

const argv = collectArgs();

const env = cleanEnv(process.env, {
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

const TheNextLegends = "0x5085CC0236ae108812571eADF24beeE4fe8E0c50";

async function main() {
	assert("tokenId" in argv, "Token ID is required");
	const { tokenId } = argv as unknown as { tokenId: number };

	const api = await getChainApi("porcini");
	const provider = getDefaultProvider("goerli");
	const caller = createKeyring(env.CALLER_PRIVATE_KEY);
	const wallet = new Wallet(env.CALLER_PRIVATE_KEY, provider);
	const { bridgeContract } = getBridgeContracts("goerli", wallet);
	const bridgeFee = await bridgeContract.bridgeFee();

	// Submit withdraw extrinsic on The Root Network
	const tokenIds = [[tokenId]];
	const destination = wallet.address;
	const collectionIds = [(await api.query.nftPeg.ethToRootNft(TheNextLegends)).toJSON()];

	const extrinsic = api.tx.nftPeg.withdraw(collectionIds, tokenIds, destination);

	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [event] = filterExtrinsicEvents(result.events, ["NftPeg.Erc721Withdraw"]);

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
	const tx = await bridgeContract.receiveMessage(...args, {
		value,
		gasLimit,
	});

	const receipt = await tx.wait();
	console.log("Claimed", receipt.transactionHash);
}

main().then(() => process.exit(0));
