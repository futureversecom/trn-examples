import { SFT_PRECOMPILE_ABI } from "@therootnetwork/evm";
import { filterTransactionEvents } from "@trne/utils/filterTransactionEvents";
import { getSFTContract } from "@trne/utils/getSFTContract";
import { withEthersProvider } from "@trne/utils/withEthersProvider";
import { ContractReceipt, utils } from "ethers";

/**
 * Use `sft.initializeCollection` to to create a new ERC-721 compatible collection.
 *
 * Assumes the caller has XRP to pay for gas.
 */
withEthersProvider("porcini", async (provider, wallet, logger) => {
	const sft = getSFTContract().connect(wallet);
	const collectionName = utils.hexlify(utils.toUtf8Bytes("MyCollection"));
	const collectionOwner = wallet.address;
	const baseUri = utils.hexlify(utils.toUtf8Bytes("https://example.com/token/"));
	const royaltyAddresses = [wallet.address];
	const royaltyEntitlements = [10_000]; // one percent

	logger.info(
		{
			parameters: {
				collectionOwner,
				collectionName,
				baseUri,
				royaltyAddresses,
				royaltyEntitlements,
			},
		},
		`create "initializeCollection" call`
	);

	logger.info(`dispatch transaction from wallet=${wallet.address}`);
	const tx = await sft.initializeCollection(
		collectionOwner,
		collectionName,
		baseUri,
		royaltyAddresses,
		royaltyEntitlements
	);
	const receipt = (await tx.wait()) as unknown as ContractReceipt;

	const [intializeEvent] = filterTransactionEvents(SFT_PRECOMPILE_ABI, receipt.logs, [
		"InitializeSftCollection",
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
