import { Client } from "xrpl";

let client: Client;
export async function getXrplClient(xrplApiUrl: string): Promise<Client> {
	if (client) return client;
	client = new Client(xrplApiUrl);
	await client.connect();
	return client;
}

export async function getCurrentLedgerIndex(client: Client): Promise<number> {
	const currentLedger = await client.request({
		method: "ledger_current",
		params: [{}],
	} as any);
	return (currentLedger.result as any).ledger_current_index;
}
