# Example for signing extrinsic with MetaMask

This example shows how to sign and send an Asset Transfer extrinsic with MetaMask and Next.js.

## Prerequisites:

Make sure to install the [MetaMask browser extension](https://metamask.io/download/) into your favourite browser.

## How to Use

In your terminal, run the following commands to start the Next.JS app:

```bash
cd examples/ui/with-metamask/

pnpm install

pnpm run dev
```

Go to `http://localhost:3000/` (or whichever port was assigned). Then click the "Connect MetaMask" button and select the account that you want to use.

If you haven't added the TRN Porcini network into your MetaMask, it will prompt you to add it. Else, it will prompt you to switch to use TRN Porcini network.

Then, click the "Execute Transfer" button to proceed with the extrinsic sign and send call. You may also want to check the console logs in your browser for the status and some details.
