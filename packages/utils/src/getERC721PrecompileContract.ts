import { Contract, Wallet } from "ethers";
import { getAddress } from "ethers/lib/utils";

import { getEthersProvider } from "./getEthersProvider";

export const collectionIdToERC721Address = (collectionId: string | number): string => {
	const collection_id_hex = (+collectionId).toString(16).padStart(8, "0");
	return getAddress(`0xAAAAAAAA${collection_id_hex.toUpperCase()}000000000000000000000000`);
};

const OWNABLE_ABI = [
	"event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",

	"function owner() public view returns (address)",
	"function renounceOwnership()",
	"function transferOwnership(address owner)",
];

export const ERC721_PRECOMPILE_ABI = [
	// ERC721
	"event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
	"event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
	"event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",

	"function balanceOf(address who) public view returns (uint256)",
	"function ownerOf(uint256 tokenId) public view returns (address)",
	"function safeTransferFrom(address from, address to, uint256 tokenId)",
	"function transferFrom(address from, address to, uint256 tokenId)",
	"function approve(address to, uint256 tokenId)",
	"function getApproved(uint256 tokenId) public view returns (address)",
	"function setApprovalForAll(address operator, bool _approved)",
	"function isApprovedForAll(address owner, address operator) public view returns (bool)",

	// ERC721 Metadata
	"function name() public view returns (string memory)",
	"function symbol() public view returns (string memory)",
	"function tokenURI(uint256 tokenId) public view returns (string memory)",

	// Root specific precompiles
	"event MaxSupplyUpdated(uint32 maxSupply)",
	"event BaseURIUpdated(string baseURI)",

	"function totalSupply() external view returns (uint256)",
	"function mint(address owner, uint32 quantity)",
	"function setMaxSupply(uint32 maxSupply)",
	"function setBaseURI(bytes baseURI)",
	"function ownedTokens(address who, uint16 limit, uint32 cursor) public view returns (uint32, uint32, uint32[] memory)",

	// Ownable
	...OWNABLE_ABI,
];

export const getERC721Precompile = (
	privateKey: string,
	precompileAddress: string,
	collectionId: string | number | null
) => {
	const wallet = new Wallet(privateKey, getEthersProvider("porcini"));

	const erc721PrecompileAddress = precompileAddress
		? precompileAddress
		: collectionIdToERC721Address(collectionId as string);

	const erc721Precompile = new Contract(erc721PrecompileAddress, ERC721_PRECOMPILE_ABI, wallet);

	// Create precompiles contract
	return {
		erc721Precompile,
		wallet,
	};
};

export function getSignerWallet(privateKey: string) {
	return new Wallet(privateKey, getEthersProvider("porcini"));
}
