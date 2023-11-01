import { ERC20_PRECOMPILE_ABI } from "@therootnetwork/evm";
import { filterTransactionEvents } from "@trne/utils/filterTransactionEvents";
import { getERC20Contract } from "@trne/utils/getERC20Contract";
import { ASTO_ASSET_ID } from "@trne/utils/porcini-assets";
import { withEthersProvider } from "@trne/utils/withEthersProvider";
import { ContractReceipt } from "ethers";

/**
 * Use `ERC20.transfer` call to transfer token.
 *
 * Assumes the caller has XRP to pay for gas.
 */
withEthersProvider("porcini", async (provider, wallet, logger) => {
	const erc20 = getERC20Contract(ASTO_ASSET_ID).connect(wallet);
	const target = wallet.address;
	const amount = 0.1 * Math.pow(10, 18); // 0.1 ASTO

	logger.info(
		{
			parameters: {
				contractAddress: erc20.address,
				target,
				amount,
			},
		},
		`create "transfer" call`
	);

	logger.info(`dispatch transaction from wallet=${wallet.address}`);
	const tx = await erc20.transfer(target, amount.toString());
	const receipt = (await tx.wait()) as unknown as ContractReceipt;

	const [transferEvent] = filterTransactionEvents(ERC20_PRECOMPILE_ABI, receipt.logs, ["Transfer"]);

	logger.info(
		{
			result: {
				transactionHash: receipt.transactionHash,
				blockNumber: receipt.blockNumber,
				transferEvent: {
					name: transferEvent.name,
					args: transferEvent.args,
				},
			},
		},
		"receive result"
	);
});
