import { ERC721_PRECOMPILE_ABI } from "@therootnetwork/evm";
import { filterTransactionEvents } from "@trne/utils/filterTransactionEvents";
import { getERC721Contract } from "@trne/utils/getERC721Contract";
import { withEthersProvider } from "@trne/utils/withEthersProvider";
import { ContractReceipt } from "ethers";

const COLLECTION_ID = 1124;

/**
 * Use `TRN721.mint` call to mint new token(s)
 *
 * Assumes the caller is the owner of the collection, and has XRP to pay for gas.
 */
withEthersProvider("porcini", async (provider, wallet, logger) => {
	const erc721 = getERC721Contract(COLLECTION_ID).connect(wallet);
	const tokenOwner = wallet.address;
	const quantity = 2;

	logger.info(
		{
			parameters: {
				contractAddress: erc721.address,
				tokenOwner,
				quantity,
			},
		},
		`create "mint" call`
	);

	logger.info(`dispatch transaction from wallet=${wallet.address}`);
	const tx = await erc721.mint(tokenOwner, quantity);
	const receipt = (await tx.wait()) as unknown as ContractReceipt;

	// 2 tokens minted = 2 transfers event
	const [transferEvent1, transferEvent2] = filterTransactionEvents(
		ERC721_PRECOMPILE_ABI,
		receipt.logs,
		["Transfer"]
	);

	logger.info(
		{
			result: {
				transactionHash: receipt.transactionHash,
				blockNumber: receipt.blockNumber,
				transferEvent1: {
					name: transferEvent1.name,
					args: transferEvent1.args,
				},
				transferEvent2: {
					name: transferEvent2.name,
					args: transferEvent2.args,
				},
			},
		},
		"receive result"
	);
});
