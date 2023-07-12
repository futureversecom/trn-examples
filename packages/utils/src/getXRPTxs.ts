import { Client } from "xrpl";

export async function getTxsInLedger(
  ledgerIndex: number,
  address: string,
  client: Client
): Promise<any> {
  let txns;
  let query = await client.request({
    command: "account_tx",
    account: address,
    ledger_index_min: ledgerIndex,
    ledger_index_max: -1,
    binary: false,
    limit: 100,
    forward: true,
  });
  txns = query.result.transactions;

  while (query.result.marker) {
    query = await client.request({
      command: "account_tx",
      account: address,
      ledger_index_min: ledgerIndex,
      ledger_index_max: -1,
      binary: false,
      limit: 300,
      marker: query.result.marker,
      forward: true,
    });
    const {
      result: { transactions },
    } = query;
    txns = [...txns, ...transactions];
  }
  return txns;
}
