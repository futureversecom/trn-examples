import {encodeAccountID} from "xrpl";
import {cleanEnv, str} from "envalid";

const env = cleanEnv(process.env, {
    trnAddress: str(), // ripple address
});

async function main() {
    const address = env.trnAddress;
    const encodeAdd = encodeAccountID(Buffer.from(address.substring(2), 'hex'));
    console.log('encoded address::', encodeAdd);
    process.exit(0);
}
main();
