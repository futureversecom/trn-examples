import { createKeyring } from "@trne/utils/createKeyring";
import { fetchFinalisedHead } from "@trne/utils/fetchFinalisedHead";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getChainApi } from "@trne/utils/getChainApi";
import { getEthersProvider } from "@trne/utils/getEthersProvider";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { cleanEnv, str } from "envalid";
import { Wallet, utils as ethers } from "ethers";

const env = cleanEnv(process.env, {
  CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

enum ProxyType {
  NoPermission = 0,
  Any = 1,
  NonTransfer = 2,
  Governance = 3,
  Staking = 4,
}

export async function main() {
  const api = await getChainApi("porcini");
  const caller = createKeyring(env.CALLER_PRIVATE_KEY);
  const wallet = new Wallet(
    env.CALLER_PRIVATE_KEY,
    getEthersProvider("porcini")
  );

  const proxyType = ProxyType.Any;
  // recommended low number, 75 blocks ~= 5 minutes
  const deadline = (await fetchFinalisedHead(api)) + 75;
  const delegate = "0x25451A4de12dcCc2D166922fA938E900fCc4ED24";
  const futurepass = (
    await api.query.futurepass.holders(caller.address)
  ).toString();

  const message = ethers
    .solidityKeccak256(
      ["address", "address", "uint8", "uint32"],
      [futurepass, delegate, proxyType, deadline]
    )
    .substring(2);
  const signature = await wallet.signMessage(message);

  const extrinsic = api.tx.futurepass.registerDelegateWithSignature(
    futurepass, //        Futurepass account to register the account as delegate
    delegate, //          The delegated account for the futurepass
    proxyType, //         Delegate permission level
    deadline, //          Deadline for the signature
    signature //          Signature of the message parameters
  );

  const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
  const [event] = filterExtrinsicEvents(result.events, [
    "Futurepass.DelegateRegistered",
  ]);

  console.log("Extrinsic Result", event.toJSON());

  await api.disconnect();
}

main();
