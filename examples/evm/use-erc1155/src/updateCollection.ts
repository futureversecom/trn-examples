import { ERC1155_PRECOMPILE_ABI } from "@therootnetwork/evm";
import { filterTransactionEvents } from "@trne/utils/filterTransactionEvents";
import { getERC1155Contract } from "@trne/utils/getERC1155Contract";
import { withEthersProvider } from "@trne/utils/withEthersProvider";
import { ContractReceipt, utils } from "ethers";

const COLLECTION_ID = 269412;

/**
 * Use `TRN1155.setBaseURI` call to update the collection `metadataScheme`.
 *
 * Similar extrinsics are available to update different properties of a collection
 *  - setMaxSupply
 *  Check out the precompile documentation (linked in README) for more details
 *
 * Assumes the caller is the owner of the collection, and has XRP to pay for gas.
 */
withEthersProvider("porcini", async (provider, wallet, logger) => {
	const erc1155 = getERC1155Contract(COLLECTION_ID).connect(wallet);
	const baseUri = utils.hexlify(utils.toUtf8Bytes("https://example.com/token/"));

	logger.info(
		{
			parameters: {
				contractAddress: erc1155.address,
				baseUri,
			},
		},
		`create "setBaseURI" call`
	);

	logger.info(`dispatch transaction from wallet=${wallet.address}`);
	const tx = await erc1155.setBaseURI(baseUri);
	const receipt = (await tx.wait()) as unknown as ContractReceipt;

	const [setEvent] = filterTransactionEvents(ERC1155_PRECOMPILE_ABI, receipt.logs, [
		"BaseURIUpdated",
	]);

	logger.info(
		{
			result: {
				transactionHash: receipt.transactionHash,
				blockNumber: receipt.blockNumber,
				setEvent: {
					name: setEvent.name,
					args: setEvent.args,
				},
			},
		},
		"receive result"
	);
});
