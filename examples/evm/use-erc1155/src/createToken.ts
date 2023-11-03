import { ERC1155_PRECOMPILE_ABI } from "@therootnetwork/evm";
import { filterTransactionEvents } from "@trne/utils/filterTransactionEvents";
import { getERC1155Contract } from "@trne/utils/getERC1155Contract";
import { withEthersProvider } from "@trne/utils/withEthersProvider";
import { ContractReceipt, utils } from "ethers";

const COLLECTION_ID = 269412;

/**
 * Use `TRN1155.createToken` call to create a new token for a collection.
 *
 * Assumes the caller has XRP to pay for gas.
 */
withEthersProvider("porcini", async (provider, wallet, logger) => {
	const erc1155 = getERC1155Contract(COLLECTION_ID).connect(wallet);
	const tokenName = utils.hexlify(utils.toUtf8Bytes("MyToken"));
	const initialIssuance = 0;
	const maxIssuance = 0; // no max issuance
	const tokenOwner = wallet.address;

	logger.info(
		{
			parameters: {
				contractAddress: erc1155.address,
				tokenName,
				initialIssuance,
				maxIssuance,
				tokenOwner,
			},
		},
		`create "createToken" call`
	);

	logger.info(`dispatch transaction from wallet=${wallet.address}`);
	const tx = await erc1155.createToken(tokenName, initialIssuance, maxIssuance, tokenOwner);
	const receipt = (await tx.wait()) as unknown as ContractReceipt;

	const [setEvent] = filterTransactionEvents(ERC1155_PRECOMPILE_ABI, receipt.logs, [
		"TokenCreated",
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
