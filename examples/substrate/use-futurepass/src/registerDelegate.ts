import { fetchFinalisedHead } from "@trne/utils/fetchFinalisedHead";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import { getEthersProvider } from "@trne/utils/withEthersProvider";
import { utils as ethers, Wallet } from "ethers";
import assert from "node:assert";

enum ProxyType {
	NoPermission = 0,
	Any = 1,
}

withChainApi("porcini", async (api, caller, logger) => {
	const provider = getEthersProvider("porcini");
	const delegate = Wallet.createRandom().connect(provider);
	const proxyType = ProxyType.Any;
	// recommended low number, 75 blocks ~= 5 minutes
	const deadline = (await fetchFinalisedHead(api)) + 75;

	const fpAccount = (await api.query.futurepass.holders(caller.address)).unwrapOr(undefined);
	assert(fpAccount);
	logger.info(
		{
			futurepass: {
				holder: caller.address,
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
		`create a "futurepass.registerDelegateWithSignature" extrinsic`
	);
	const extrinsic = api.tx.futurepass.registerDelegateWithSignature(
		fpAccount, //        Futurepass account to register the account as delegate
		delegate.address, //          The delegated account for the futurepass
		proxyType, //         Delegate permission level
		deadline, //          Deadline for the signature
		signature //          Signature of the message parameters
	);

	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	const [delegatedEvent] = filterExtrinsicEvents(result.events, ["Futurepass.DelegateRegistered"]);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				delegatedEvent: formatEventData(delegatedEvent.event),
			},
		},
		"receive result"
	);
});
