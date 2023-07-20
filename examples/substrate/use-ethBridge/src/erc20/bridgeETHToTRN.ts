/* eslint-disable @typescript-eslint/no-explicit-any */
import { collectArgs } from "@trne/utils/collectArgs";
import { getChainApi } from "@trne/utils/getChainApi";
import { cleanEnv, str } from "envalid";
import { utils as ethers, getDefaultProvider, Wallet } from "ethers";

import { getBridgeContracts, getERC20Contract } from "../contracts";

const argv = collectArgs();
const env = cleanEnv(process.env, {
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

const SyloAsset = {
	decimals: 18,
	address: "0x147dE5ddE61c38A5289a398B7bC096DF88E6251F",
};

const EthAsset = {
	decimals: 18,
	address: "0x0000000000000000000000000000000000000000",
};

async function main() {
	const { asset } = argv as unknown as { asset: string };
	const isETH = asset === "ETH";

	const api = await getChainApi("porcini");
	const provider = getDefaultProvider("goerli");
	const wallet = new Wallet(env.CALLER_PRIVATE_KEY, provider);
	const syloContract = getERC20Contract(SyloAsset.address, wallet);
	const { bridgeContract, erc20PegContract } = getBridgeContracts("goerli", wallet);

	const destination = wallet.address;
	const tokenAddress = isETH ? EthAsset.address : SyloAsset.address;
	// Bridge requires a small fee
	const sendMessageFee = ethers.formatEther(await bridgeContract.sendMessageFee());
	const transferAmount = isETH ? "0.001" : "1";
	const amount = ethers.parseUnits(transferAmount, isETH ? EthAsset.decimals : SyloAsset.decimals);

	const args = [tokenAddress, amount, destination];
	const value = ethers.parseEther(
		isETH ? String(Number(transferAmount) + Number(sendMessageFee)) : sendMessageFee
	);

	// ERC20 tokens require approval
	if (!isETH) {
		const approveTx = await syloContract.approve(erc20PegContract.address, amount);
		const approveReceipt = await approveTx.wait();
		console.log("approved", approveReceipt.transactionHash);
	}

	const gasLimit = await erc20PegContract.estimateGas.deposit(...args, {
		value,
	});
	const tx = await erc20PegContract.deposit(...args, {
		value,
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
