import { ContractReceipt, utils } from "ethers";
import assert from "node:assert";

export function filterTransactionEvents(
	abi: string[],
	logs: ContractReceipt["logs"],
	eventNames: string[]
) {
	const int = new utils.Interface(abi);

	return eventNames.map((eventName) => {
		const event = logs.map((log) => int.parseLog(log)).find((event) => event.name === eventName);
		assert(event);
		return event;
	});
}
