import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

withChainApi("porcini", async (api, caller) => {
	const delegate = "0x25451A4de12dcCc2D166922fA938E900fCc4ED24";
	const futurepass = (await api.query.futurepass.holders(caller.address)).unwrap();

	const extrinsic = api.tx.futurepass.unregisterDelegate(
		futurepass, // Futurepass account to unregister the delegate from
		delegate //    The delegated account for the futurepass. Note: if caller is futurepass
		//             holder owner, they can remove any delegate (including themselves);
		//             otherwise the caller must be the delegate (can only remove themself)
	);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [event] = filterExtrinsicEvents(result.events, ["Futurepass.DelegateUnregistered"]);

	console.log("Extrinsic Result", event.toJSON());
});
