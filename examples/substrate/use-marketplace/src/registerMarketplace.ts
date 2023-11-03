import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

/**
 * Use `marketplace.registerMarketplace` to register a new marketplace
 *
 * Assumes caller has XRP to pay gas.
 */
withChainApi("porcini", async (api, caller, logger) => {
	const marketplaceAccount = caller.address;
	const entitlement = 10_000; // One percent

	logger.info(
		{
			parameters: {
				marketplaceAccount,
				entitlement,
			},
		},
		`create a "marketplace.registerMarketplace" extrinsic`
	);
	const extrinsic = api.tx.marketplace.registerMarketplace(marketplaceAccount, entitlement);

	logger.info(`dispatch extrinsic from caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	const [registerEvent] = filterExtrinsicEvents(result.events, ["Marketplace.MarketplaceRegister"]);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				registerEvent: formatEventData(registerEvent.event),
			},
		},
		"receive result"
	);
});
