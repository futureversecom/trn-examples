import { BN, hexToU8a } from "@polkadot/util";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

withChainApi("porcini", async (api, caller) => {
	const futurepass = (await api.query.futurepass.holders(caller.address)).toString();
	// Force error as Asset ID 3 does not exist
	const call = api.tx.assets.transfer(3, futurepass, 1);

	const extrinsic = api.tx.futurepass.proxyExtrinsic(futurepass, call);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [{ event }] = filterExtrinsicEvents(result.events, ["Proxy.ProxyExecuted"]);

	const { err } = event.data[0].toJSON() as {
		err: {
			module: {
				index: number;
				error: `0x${string}`;
			};
		};
	};

	const { section, name, docs } = api.registry.findMetaError({
		index: new BN(err.module.index),
		error: hexToU8a(err.module.error),
	});
	console.log(`Proxy extrinsic failed, [${section}.${name}] ${docs}`);
});
