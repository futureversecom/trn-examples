import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { ROOT_ASSET_ID, XRP_ASSET_ID } from "@trne/utils/porcini-assets";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

interface AmountsIn {
    Ok: [number, number];
}

/**
 * Use `feeProxy.callWithFeePreferences` to trigger `xrplBridge.withdrawXrp` call, and pay gas
 * in ROOT token.
 *
 * Assumes the caller has ROOT balance.
 */
withChainApi("porcini", async (api, caller, logger) => {
    /**
     * 1. Create `xrplBridge.withdrawXrp` call
     */
    //
    logger.info(
        {
            parameters: {
                amount: 1000000,
                destination: "0x72ee785458b89d5ec64bec8410c958602e6f7673",
            },
        },
        `create a "xrplBridge.withdrawXrp"`
    );
    const bridgeWithdrawalCall = api.tx.xrplBridge.withdrawXrp(10, "0x72ee785458b89d5ec64bec8410c958602e6f7673");

    /**
     * 2. Determine the `maxPayment` in ROOT by estimate the gas cost and use `dex` to get a quote
     */
        // we need a dummy feeProxy call (with maxPayment=0) to do a proper fee estimation
    const feeProxyCallForEstimation = api.tx.feeProxy.callWithFeePreferences(
            ROOT_ASSET_ID,
            0,
            bridgeWithdrawalCall
        );
    const paymentInfo = await feeProxyCallForEstimation.paymentInfo(caller.address);
    const estimatedFee = paymentInfo.partialFee.toString();

    // query the the `dex` to determine the `maxPayment` you are willing to pay
    const {
        Ok: [amountIn],
    } = (await api.rpc.dex.getAmountsIn(estimatedFee, [
        ROOT_ASSET_ID,
        XRP_ASSET_ID,
    ])) as unknown as AmountsIn;

    // allow a buffer to avoid slippage, 5%
    const maxPayment = Number(amountIn * 1.05).toFixed();

    /**
     * 3. Create and dispatch `feeProxy.callWithFeePreferences` extrinsic
     */
    logger.info(
        {
            parameters: {
                paymentAsset: ROOT_ASSET_ID,
                maxPayment,
                call: bridgeWithdrawalCall.toJSON(),
            },
        },
        `create a "feeProxy.callWithFeePreferences"`
    );
    const feeProxyCall = api.tx.feeProxy.callWithFeePreferences(
        ROOT_ASSET_ID,
        maxPayment,
        bridgeWithdrawalCall
    );

    logger.info(`dispatch extrinsic from caller="${caller.address}"`);
    const { result, extrinsicId } = await sendExtrinsic(feeProxyCall, caller, { log: logger });
    const [proxyEvent, withdrawalEvent] = filterExtrinsicEvents(result.events, [
        "FeeProxy.CallWithFeePreferences",
        "XrplBridge.WithdrawRequest"
    ]);

    logger.info(
        {
            result: {
                extrinsicId,
                blockNumber: result.blockNumber,
                proxyEvent: formatEventData(proxyEvent.event),
                xrplWithdrawlEvent: formatEventData(withdrawalEvent.event),
            },
        },
        "receive result"
    );
});
