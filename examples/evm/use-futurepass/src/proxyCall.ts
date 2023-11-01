import { ERC20_ABI, FUTUREPASS_PRECOMPILE_ABI } from "@therootnetwork/evm";
import { ALICE } from "@trne/utils/accounts";
import { filterTransactionEvents } from "@trne/utils/filterTransactionEvents";
import { getERC20Contract } from "@trne/utils/getERC20Contract";
import { getFuturepassContract } from "@trne/utils/getFuturepassContract";
import { getFuturepassRegistrarContract } from "@trne/utils/getFuturepassRegistrarContract";
import { ASTO_ASSET_ID } from "@trne/utils/porcini-assets";
import { withEthersProvider } from "@trne/utils/withEthersProvider";
import { ContractReceipt, utils } from "ethers";
import assert from "node:assert";

const CALL_TYPE = {
	StaticCall: 0,
	Call: 1,
	DelegateCall: 2,
	Create: 3,
	Create2: 4,
};

/**
 * Use `futurepass.proxyCall` call to call `erc20.transfer` and have the FPass account transfers
 * the amount
 *
 * Assume wallet has XRP to pay for gas.
 */
withEthersProvider("porcini", async (provider, wallet, logger) => {
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
	const fp = getFuturepassContract(fpAccount).connect(wallet);

	const transferAmount = utils.parseUnits("0.1", 18); // 0.1 ASTO
	const transferToken = getERC20Contract(ASTO_ASSET_ID);
	const transferCalldata = new utils.Interface(ERC20_ABI).encodeFunctionData("transfer", [
		ALICE,
		transferAmount,
	]);

	logger.info(
		{
			parameters: {
				callType: CALL_TYPE.Call,
				callTarget: transferToken.address,
				value: "0",
				callData: transferCalldata,
			},
		},
		`create a "futurepass.proxyCall" call`
	);

	logger.info(`dispatch transaction from wallet=${wallet.address}`);
	const tx = await fp.proxyCall(CALL_TYPE.Call, transferToken.address, "0", transferCalldata);

	const receipt = (await tx.wait()) as unknown as ContractReceipt;
	const [transferEvent, executedEvent] = filterTransactionEvents(
		[...ERC20_ABI, ...FUTUREPASS_PRECOMPILE_ABI],
		receipt.logs,
		["Transfer", "Executed"]
	);

	logger.info(
		{
			result: {
				transactionHash: receipt.transactionHash,
				blockNumber: receipt.blockNumber,
				transferEvent: {
					name: transferEvent.name,
					args: transferEvent.args,
				},

				executedEvent: {
					name: executedEvent.name,
					args: executedEvent.args,
				},
			},
		},
		"receive result"
	);
});
