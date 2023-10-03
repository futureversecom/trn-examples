import { ERC20_ABI } from "@therootnetwork/evm";
import { ALICE } from "@trne/utils/accounts";
import { filterTransactionEvents } from "@trne/utils/filterTransactionEvents";
import { getERC20Contract } from "@trne/utils/getERC20Contract";
import { getFeeProxyContract } from "@trne/utils/getFeeProxyContract";
import { getFeeProxyPricePair } from "@trne/utils/getFeeProxyPricePair";
import { ASTO_ASSET_ID, SYLO_ASSET_ID } from "@trne/utils/porcini-assets";
import { withEthersProvider } from "@trne/utils/withEthersProvider";
import { ContractReceipt, utils } from "ethers";

/**
 * Use `feeProxy.callWithFeePreferences` to trigger a `transfer` call of SYLO token, and pay gas
 * in ASTO token.
 *
 * Assumes the caller has some ASTO balance.
 */
withEthersProvider("porcini", async (provider, wallet, logger) => {
	// contracts creation
	const feeProxy = getFeeProxyContract().connect(wallet);
	const sylo = getERC20Contract(SYLO_ASSET_ID).connect(wallet);
	const asto = getERC20Contract(ASTO_ASSET_ID).connect(wallet);

	// transfer call
	const transferAmount = utils.parseUnits("1.0", 18); // 1 SYLO
	const transferInput = new utils.Interface(ERC20_ABI).encodeFunctionData("transfer", [
		ALICE,
		transferAmount,
	]);
	const transferEstimate = await sylo.estimateGas.transfer(ALICE, transferAmount);

	logger.info(
		`prepare a transfer call with destination="${ALICE}", amount="${transferAmount}", and estimateGas="${transferEstimate}"`
	);

	// retrieve the maxPayment and maxFeePerGas parameters with slippage to be 0.05 (5%)
	const { maxPayment, maxFeePerGas } = await getFeeProxyPricePair(
		provider,
		transferEstimate,
		ASTO_ASSET_ID,
		0.05
	);

	logger.info(
		`dispatch a feeProxy call with maxPayment="${maxPayment}", and maxFeePerGas="${maxFeePerGas}"`
	);

	const tx = await feeProxy.callWithFeePreferences(
		asto.address,
		maxPayment,
		sylo.address,
		transferInput,
		{
			gasLimit: transferEstimate,
			maxFeePerGas: maxFeePerGas,
			maxPriorityFeePerGas: 0,
		}
	);

	const receipt = (await tx.wait()) as unknown as ContractReceipt;

	const [transferEvent] = filterTransactionEvents(ERC20_ABI, receipt.logs, ["Transfer"]);

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
