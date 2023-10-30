import { ERC721_PRECOMPILE_ABI } from "@therootnetwork/evm";
import { filterTransactionEvents } from "@trne/utils/filterTransactionEvents";
import { getERC721Contract } from "@trne/utils/getERC721Contract";
import { withEthersProvider } from "@trne/utils/withEthersProvider";
import { ContractReceipt, utils } from "ethers";

const COLLECTION_ID = 1124;

/**
 * Use `TRN721.setBaseURI` call to update the collection `metadataScheme`.
 *
 * Similar extrinsics are available to update different properties of a collection
 *  - setMaxSupply
 *  Check out the precompile documentation (linked in README) for more details
 *
 * Assumes the caller is the owner of the collection, and has some XRP to pay for gas.
 */
withEthersProvider("porcini", async (provider, wallet, logger) => {
	const erc721 = getERC721Contract(COLLECTION_ID).connect(wallet);
	const baseUri = utils.hexlify(utils.toUtf8Bytes("https://example.com/token/"));

	logger.info(
		{
			parameters: {
				contractAddress: erc721.address,
				baseUri,
			},
		},
		`create "setBaseURI" call`
	);

	logger.info(`dispatch transaction from wallet=${wallet.address}`);
	const tx = await erc721.setBaseURI(baseUri);
	const receipt = (await tx.wait()) as unknown as ContractReceipt;

	const [setEvent] = filterTransactionEvents(ERC721_PRECOMPILE_ABI, receipt.logs, [
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
