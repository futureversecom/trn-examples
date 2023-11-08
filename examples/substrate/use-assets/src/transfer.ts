import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { ASTO_ASSET_ID } from "@trne/utils/porcini-assets";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

withChainApi("porcini", async (api, caller, logger) => {
	const assetId = ASTO_ASSET_ID;
	const target = caller.address;
	const amount = 0.1 * Math.pow(10, 18); // 0.1 ASTO

	logger.info(
		{
			parameters: {
				assetId,
				target,
				amount,
			},
		},
		`create a "assets.transfer" extrinsic`
	);
	const extrinsic = api.tx.assets.transfer(assetId, target, amount.toString());

	logger.info(`dispatch extrinsic from caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	const [transferEvent] = filterExtrinsicEvents(result.events, ["Assets.Transferred"]);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				transferEvent: formatEventData(transferEvent.event),
			},
		},
		"receive result"
	);
});
