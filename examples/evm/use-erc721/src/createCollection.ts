import { NFT_PRECOMPILE_ABI } from "@therootnetwork/evm";
import { filterTransactionEvents } from "@trne/utils/filterTransactionEvents";
import { getNFTContract } from "@trne/utils/getNFTContract";
import { withEthersProvider } from "@trne/utils/withEthersProvider";
import { ContractReceipt, utils } from "ethers";

/**
 * Use `nft.initializeCollection` to to create a new ERC-721 compatible collection.
 *
 * Assumes the caller has XRP to pay for gas.
 */
withEthersProvider("porcini", async (provider, wallet, logger) => {
	const nft = getNFTContract().connect(wallet);
	const collectionName = utils.hexlify(utils.toUtf8Bytes("MyCollection"));
	const maxIssuance = 0; // no max issuance
	const collectionOwner = wallet.address;
	const baseUri = utils.hexlify(utils.toUtf8Bytes("https://example.com/token/"));
	const royaltyAddresses = [wallet.address];
	const royaltyEntitlements = [10_000]; // one percent

	logger.info(
		{
			parameters: {
				collectionOwner,
				collectionName,
				maxIssuance,
				baseUri,
				royaltyAddresses,
				royaltyEntitlements,
			},
		},
		`create "initializeCollection" call`
	);

	logger.info(`dispatch transaction from wallet=${wallet.address}`);
	const tx = await nft.initializeCollection(
		collectionOwner,
		collectionName,
		maxIssuance,
		baseUri,
		royaltyAddresses,
		royaltyEntitlements
	);
	const receipt = (await tx.wait()) as unknown as ContractReceipt;

	const [intializeEvent] = filterTransactionEvents(NFT_PRECOMPILE_ABI, receipt.logs, [
		"InitializeCollection",
	]);

	logger.info(
		{
			result: {
				transactionHash: receipt.transactionHash,
				blockNumber: receipt.blockNumber,
				intializeEvent: {
					name: intializeEvent.name,
					args: intializeEvent.args,
				},
			},
		},
		"receive result"
	);
});
