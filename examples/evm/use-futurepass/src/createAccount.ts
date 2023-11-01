import { FUTUREPASS_REGISTRAR_PRECOMPILE_ABI } from "@therootnetwork/evm";
import { filterTransactionEvents } from "@trne/utils/filterTransactionEvents";
import { getFuturepassRegistrarContract } from "@trne/utils/getFuturepassRegistrarContract";
import { withEthersProvider } from "@trne/utils/withEthersProvider";
import { ContractReceipt, Wallet } from "ethers";

/**
 * Use `registrar.create` call to create a FPass account.
 *
 * Assumes the caller has some XRP to pay for gas.
 */
withEthersProvider("porcini", async (provider, wallet, logger) => {
	const owner = Wallet.createRandom();
	const registrar = getFuturepassRegistrarContract().connect(wallet);

	logger.info(
		{
			parameters: {
				contractAddress: registrar.address,
				owner: owner.address,
			},
		},
		`create "registrar.create" call`
	);

	logger.info(`dispatch transaction from wallet=${wallet.address}`);
	const tx = await registrar.create(owner.address);

	const receipt = (await tx.wait()) as unknown as ContractReceipt;

	const [createEvent] = filterTransactionEvents(FUTUREPASS_REGISTRAR_PRECOMPILE_ABI, receipt.logs, [
		"FuturepassCreated",
	]);

	logger.info(
		{
			result: {
				transactionHash: receipt.transactionHash,
				blockNumber: receipt.blockNumber,
				createEvent: {
					name: createEvent.name,
					args: createEvent.args,
				},
			},
		},
		"receive result"
	);
});
