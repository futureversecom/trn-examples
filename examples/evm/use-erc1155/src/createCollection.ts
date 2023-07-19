import { getSFTPrecompile } from "@trne/utils/getSFTPrecompile";
import assert from "assert";
import { cleanEnv, str } from "envalid";
import { ethers } from "ethers";

const env = cleanEnv(process.env, {
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

export async function main() {
	const { sftPrecompile, wallet } = getSFTPrecompile(env.CALLER_PRIVATE_KEY);

	const owner = wallet.address;
	const name = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Collection"));
	const metadataPath = ethers.utils.hexlify(
		ethers.utils.toUtf8Bytes("https://example.com/sft/metadata")
	);
	const royaltyAddresses = [wallet.address];
	const royaltyEntitlements = [1000];

	const initializeTx = await sftPrecompile
		.connect(wallet)
		.initializeCollection(owner, name, metadataPath, royaltyAddresses, royaltyEntitlements);
	const receipt = await initializeTx.wait();

	// new collection with unlimited mintable supply
	const erc1155PrecompileAddress = (receipt?.events as any)[0].args.precompileAddress;
	//InitializeCollection
	const { event } = (receipt?.events as any)[0];
	const { collectionOwner, precompileAddress } = (receipt?.events as any)[0].args;
	console.log("erc1155PrecompileAddress::", erc1155PrecompileAddress);
	assert(event === "InitializeSftCollection", `Incorrect event ${event}`);
	assert(collectionOwner === wallet.address, `Incorrect from field ${collectionOwner}`);
	assert(
		precompileAddress.toLowerCase().startsWith("0xbbbbbbbb"),
		`Incorrect to field ${precompileAddress}`
	);
}

main();
