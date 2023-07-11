import { Contract, getDefaultProvider, Wallet } from "ethers";
import { getPublicProviderUrl } from "@therootnetwork/api";
import { getAddress } from "ethers/lib/utils";
export const assetIdToERC20ContractAddress = (
  assetId: string | number
): string => {
  const asset_id_hex = (+assetId).toString(16).padStart(8, "0");
  return getAddress(
    `0xCCCCCCCC${asset_id_hex.toUpperCase()}000000000000000000000000`
  );
};

export const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function balanceOf(address who) public view returns (uint256)",
  "function name() public view returns (string memory)",
  "function symbol() public view returns (string memory)",
  "function decimals() public view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function transfer(address who, uint256 amount)",
  "function transferFrom(address from, address to, uint256 amount)",
];

export const getERC20PrecompileForAssetId = (
  privateKey: string,
  assetId: string | number
) => {
  const wallet = new Wallet(
    privateKey,
    getDefaultProvider(getPublicProviderUrl("porcini"))
  );

  const erc20PrecompileAddress = assetIdToERC20ContractAddress(assetId);

  // Create precompiles contract
  return {
    erc20Precompile: new Contract(erc20PrecompileAddress, ERC20_ABI, wallet),
    wallet,
  };
};
