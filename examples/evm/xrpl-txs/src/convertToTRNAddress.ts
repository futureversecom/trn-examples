import {convertStringToHex, decodeAccountID} from "xrpl";
import {cleanEnv, str} from "envalid";

const env = cleanEnv(process.env, {
    rippleAddress: str(), // ripple address
});

async function main() {
    const address = decodeAccountID(env.rippleAddress);
    console.log('Address:', `0x${convertStringToHex(address)}`);
    process.exit(0);
}
main();
