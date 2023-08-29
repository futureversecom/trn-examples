import { fetchFinalisedHead } from "@trne/utils/fetchFinalisedHead";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getEthersProvider } from "@trne/utils/getEthersProvider";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import { cleanEnv, str } from "envalid";
import { utils as ethers, Wallet } from "ethers";

const env = cleanEnv(process.env, {
	DELEGATE_PRIVATE_KEY: str(),
});

enum ProxyType {
	NoPermission = 0,
	Any = 1,
	NonTransfer = 2,
	Governance = 3,
	Staking = 4,
}

withChainApi("porcini", async (api, caller) => {
	const delegateWallet = new Wallet(env.DELEGATE_PRIVATE_KEY, getEthersProvider("porcini"));
	const delegate = delegateWallet.address;

	const proxyType = ProxyType.Any;
	// recommended low number, 75 blocks ~= 5 minutes
	const deadline = (await fetchFinalisedHead(api)) + 75;
	const futurepass = (await api.query.futurepass.holders(caller.address)).unwrap();

	const message = ethers
		.solidityKeccak256(
			["address", "address", "uint8", "uint32"],
			[futurepass, delegate, proxyType, deadline]
		)
		.substring(2);
	const signature = await delegateWallet.signMessage(message);

	const extrinsic = api.tx.futurepass.registerDelegateWithSignature(
		futurepass, //        Futurepass account to register the account as delegate
		delegate, //          The delegated account for the futurepass
		proxyType, //         Delegate permission level
		deadline, //          Deadline for the signature
		signature //          Signature of the message parameters
	);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [event] = filterExtrinsicEvents(result.events, ["Futurepass.DelegateRegistered"]);

	console.log("Extrinsic Result", event.toJSON());
});
