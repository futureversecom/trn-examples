import { ERC1155_PRECOMPILE_ABI } from "@therootnetwork/evm";
import { filterTransactionEvents } from "@trne/utils/filterTransactionEvents";
import { getERC1155Contract } from "@trne/utils/getERC1155Contract";
import { withEthersProvider } from "@trne/utils/withEthersProvider";
import { ContractReceipt } from "ethers";

const COLLECTION_ID = 269412;
const TOKEN_ID = 1;

/**
 * Use `TRN1155.mint` call to mint new tokens.
 *
 * Assumes the caller has XRP to pay for gas.
 */
withEthersProvider("porcini", async (provider, wallet, logger) => {
	const erc1155 = getERC1155Contract(COLLECTION_ID).connect(wallet);
	const tokenOwner = wallet.address;
	const tokenId = TOKEN_ID;
	const amount = 10;

	logger.info(
		{
			parameters: {
				contractAddress: erc1155.address,
				tokenOwner,
				tokenId,
				amount,
			},
		},
		`create "mint" call`
	);

	logger.info(`dispatch transaction from wallet=${wallet.address}`);
	const tx = await erc1155.mint(tokenOwner, tokenId, amount);
	const receipt = (await tx.wait()) as unknown as ContractReceipt;

	const [transferEvent] = filterTransactionEvents(ERC1155_PRECOMPILE_ABI, receipt.logs, [
		"TransferSingle",
	]);

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
