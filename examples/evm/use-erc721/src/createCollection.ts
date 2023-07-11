import { cleanEnv, str } from "envalid";
import assert from "assert";
import { getERC721Precompile } from "@trne/utils/getERC721PrecompileContract";
import { getNFTPrecompile } from "@trne/utils/getNFTPrecompile";
import { BigNumber, ethers } from "ethers";

const env = cleanEnv(process.env, {
  CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

export async function main() {
  const { nftPrecompile, wallet } = getNFTPrecompile(env.CALLER_PRIVATE_KEY);

  const maxIssuance = BigNumber.from(0);
  const metadataPath = ethers.utils.hexlify(
    ethers.utils.toUtf8Bytes("https://example.com/metadata/")
  );
  const name = "test";
  const royaltyAddresses = [wallet.address];
  const royaltyEntitlements = [1000];
  // new collection with unlimited mintable supply
  const tx = await nftPrecompile
    .connect(wallet)
    .initializeCollection(
      wallet.address,
      ethers.utils.hexlify(ethers.utils.toUtf8Bytes(name)),
      maxIssuance,
      metadataPath,
      royaltyAddresses,
      royaltyEntitlements
    );
  const receipt = await tx.wait();
  const erc721PrecompileAddress = (receipt?.events as any)[0].args
    .precompileAddress;
  //InitializeCollection
  const { event } = (receipt?.events as any)[0];
  const { collectionOwner, precompileAddress } = (receipt?.events as any)[0]
    .args;
  console.log("(receipt?.events as any)[0];::", (receipt?.events as any)[0]);
  console.log(
    "(receipt?.events as any)[0].args;::",
    (receipt?.events as any)[0].args
  );
  console.log("erc721PrecompileAddress::", erc721PrecompileAddress);
  assert(event === "InitializeCollection", `Incorrect event ${event}`);
  assert(
    collectionOwner === wallet.address,
    `Incorrect from field ${collectionOwner}`
  );
  assert(
    precompileAddress.toLowerCase().startsWith("0xaaaaaa"),
    `Incorrect to field ${precompileAddress}`
  );
}

main();
