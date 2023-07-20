/* eslint-disable @typescript-eslint/no-explicit-any */
import { collectArgs } from "@trne/utils/collectArgs";
import { getChainApi } from "@trne/utils/getChainApi";
import assert from "assert";
import { cleanEnv, str } from "envalid";
import { BigNumber, getDefaultProvider, Wallet } from "ethers";

import { getBridgeContracts, getERC721Contract } from "../contracts";

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
	const wallet = new Wallet(env.CALLER_PRIVATE_KEY, provider);
	const TheNextLegendsContract = getERC721Contract(TheNextLegends, wallet);
	const { bridgeContract, erc721PegContract } = getBridgeContracts("goerli", wallet);

	const destination = wallet.address;
	const tokenAddresses = [TheNextLegends];
	const tokenIds = [[BigNumber.from(tokenId)]];
	const args = [tokenAddresses, tokenIds, destination];
	// Bridge requires a small fee
	const sendMessageFee = await bridgeContract.sendMessageFee();

	// ERC721 tokens require approval
	const approveTx = await TheNextLegendsContract.approve(
		erc721PegContract.address,
		BigNumber.from(tokenId)
	);
	const approveReceipt = await approveTx.wait();
	console.log("approved", approveReceipt.transactionHash);

	const gasLimit = await erc721PegContract.estimateGas.deposit(...args, {
		value: sendMessageFee,
	});
	const tx = await erc721PegContract.deposit(...args, {
		value: sendMessageFee,
		gasLimit,
	});

	const receipt = await tx.wait();
	console.log("deposited", receipt.transactionHash);

	await new Promise<void>((resolve) => {
		// subscribe to system events via storage
		api.query.system.events((events: any[]) => {
			console.log(`\nReceived ${events.length} event(s):`);

			// loop through the Vec<EventRecord>
			events.forEach((record) => {
				const { event } = record;
				if (event.section === "ethBridge" && event.method === "EventSubmit") {
					console.log(`ETH Bridge transaction added successfully, for event id ${event.data[0]}`);
				}

				if (event.section === "ethBridge" && event.method === "ProcessingOk") {
					console.log(
						`ETH Bridge transaction executed successfully, for event id ${event.data[0]}`
					);
					resolve();
				}
			});
		});
	});

	await api.disconnect();
}

main().then(() => process.exit(0));
