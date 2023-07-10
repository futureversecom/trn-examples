// Precompile address for nft precompile is 1721
import { Contract, getDefaultProvider, Wallet } from "ethers";
import { getPublicProviderUrl } from "@therootnetwork/api";

export const NFT_PRECOMPILE_ADDRESS =
  "0x00000000000000000000000000000000000006b9";

export const NFT_PRECOMPILE_ABI = [
  "event InitializeCollection(address indexed collectionOwner, address precompileAddress)",
  "function initializeCollection(address owner, bytes name, uint32 maxIssuance, bytes metadataPath, address[] royaltyAddresses, uint32[] royaltyEntitlements) returns (address, uint32)",
];

export const getNFTPrecompile = (privateKey: string) => {
  const wallet = new Wallet(
    privateKey,
    getDefaultProvider(getPublicProviderUrl("porcini"))
  );
  const nftPrecompile = new Contract(
    NFT_PRECOMPILE_ADDRESS,
    NFT_PRECOMPILE_ABI,
    wallet
  );

  // Create precompiles contract
  return {
    nftPrecompile,
    wallet,
  };
};
