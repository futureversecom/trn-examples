import { FUTUREPASS_PRECOMPILE_ABI } from "@therootnetwork/evm";
import { filterTransactionEvents } from "@trne/utils/filterTransactionEvents";
import { getFuturepassContract } from "@trne/utils/getFuturepassContract";
import { getFuturepassRegistrarContract } from "@trne/utils/getFuturepassRegistrarContract";
import { withEthersProvider } from "@trne/utils/withEthersProvider";
import { ContractReceipt, utils as ethers, Wallet } from "ethers";
import assert from "node:assert";

enum ProxyType {
	NoPermission = 0,
	Any = 1,
}

/**
 * Use `futurepass.registerDelegateWithSignature` call to add delegate to an existing FPass account
 *
 * Assumes wallet has XRP to pay for gas.
 */
withEthersProvider("porcini", async (provider, wallet, logger) => {
	const delegate = Wallet.createRandom();
	const proxyType = ProxyType.Any;
	// recommended low number, 75 blocks ~= 5 minutes
	const deadline = (await provider.getBlockNumber()) + 75;
	const registrar = getFuturepassRegistrarContract().connect(provider);
	const fpAccount = await registrar.futurepassOf(wallet.address);
	assert(fpAccount);
	logger.info(
		{
			futurepass: {
				holder: wallet.address,
				account: fpAccount.toString(),
			},
		},
		"futurepass details"
	);

	const message = ethers
		.solidityKeccak256(
			["address", "address", "uint8", "uint32"],
			[fpAccount, delegate.address, proxyType, deadline]
		)
		.substring(2);
	logger.info(
		{
			payload: {
				fpAccount,
				address: delegate.address,
				proxyType,
				deadline,
			},
		},
		"require delegate to sign a payload"
	);
	const signature = await delegate.signMessage(message);

	logger.info(
		{
			parameters: {
				fpAccount,
				address: delegate.address,
				proxyType,
				deadline,
				signature,
			},
		},
		`create a "futurepass.registerDelegateWithSignature" call`
	);

	const fp = getFuturepassContract(fpAccount).connect(wallet);
	logger.info(`dispatch transaction from wallet=${wallet.address}`);
	const tx = await fp.registerDelegateWithSignature(
		delegate.address,
		proxyType,
		deadline,
		signature
	);

	const receipt = (await tx.wait()) as unknown as ContractReceipt;

	const [delegatedEvent] = filterTransactionEvents(FUTUREPASS_PRECOMPILE_ABI, receipt.logs, [
		"FuturepassDelegateRegistered",
	]);

	logger.info(
		{
			result: {
				transactionHash: receipt.transactionHash,
				blockNumber: receipt.blockNumber,
				delegatedEvent: {
					name: delegatedEvent.name,
					args: delegatedEvent.args,
				},
			},
		},
		"receive result"
	);
});
