import { ApiPromise } from "@polkadot/api";
import { ERC20_ABI } from "@therootnetwork/evm";
import { ALICE } from "@trne/utils/accounts";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { getERC20Contract } from "@trne/utils/getERC20Contract";
import { Logger } from "@trne/utils/getLogger";
import { SYLO_ASSET_ID } from "@trne/utils/porcini-assets";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import { provideEthersProvider } from "@trne/utils/withEthersProvider";
import { utils } from "ethers";
import assert from "node:assert";

/**
 * Use `futurepass.proxyExtrinsic` to trigger `evm.call`
 *
 * Assumes the caller has a Futurepass account, some XRP balance to pay for gas
 * and some SYLO balance to demonstrate the transfer
 */
withChainApi("porcini", async (api, caller, logger) => {
	const fpAccount = (await api.query.futurepass.holders(caller.address)).unwrap();
	assert(fpAccount);

	const evmCall = await createEVMCall(fpAccount.toString(), api, logger);

	logger.info(
		{
			parameters: {
				futurepass: fpAccount,
				call: evmCall.toJSON(),
			},
		},
		`create a "futurepass.proxyExtrinsic"`
	);
	const futurepassCall = api.tx.futurepass.proxyExtrinsic(fpAccount, evmCall);

	logger.info({ extrinsic: futurepassCall.toJSON() }, `dispatch "futurepass.proxyExtrinsic"`);

	const { result, extrinsicId } = await sendExtrinsic(futurepassCall, caller, { log: logger });

	const [futurepassEvent, evmLogEvent, aliceTransferEvent] = filterExtrinsicEvents(result.events, [
		"Futurepass.ProxyExecuted",
		"Evm.Log",
		{ name: "Assets.Transferred", key: "to", data: { value: ALICE, type: "T::AccountId" } },
	]);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				futurepassEvent: formatEventData(futurepassEvent.event),
				evmLogEvent: formatEventData(evmLogEvent.event),
				aliceTransferEvent: formatEventData(aliceTransferEvent.event),
			},
		},
		"dispatch result"
	);
});

export async function createEVMCall(caller: string, api: ApiPromise, logger: Logger) {
	// setup the actual EVM transaction, as interface
	const { provider, wallet } = await provideEthersProvider("porcini");
	const transferToken = getERC20Contract(SYLO_ASSET_ID).connect(wallet);
	const transferAmount = utils.parseUnits("0.1", 18); // 0.1 SYLO
	const transferInput = new utils.Interface(ERC20_ABI).encodeFunctionData("transfer", [
		ALICE,
		transferAmount,
	]);
	const transferEstimate = await transferToken.estimateGas.transfer(ALICE, transferAmount);
	const { lastBaseFeePerGas: maxFeePerGas } = await provider.getFeeData();
	assert(maxFeePerGas);

	logger.info(
		{
			parameters: {
				source: caller,
				target: transferToken.address,
				input: transferInput,
				gasLimit: transferEstimate.toString(),
				maxFeePerGas: maxFeePerGas.toString(),
			},
		},
		`create an "emv.call"`
	);

	return api.tx.evm.call(
		caller,
		transferToken.address,
		transferInput,
		0,
		transferEstimate.toString(),
		maxFeePerGas.toString(),
		0,
		null,
		[]
	);
}
