import { getEthersProvider } from "@trne/utils/getEthersProvider";
import { Contract, ethers, getDefaultProvider, Wallet } from "ethers";
import { getAddress } from "ethers/lib/utils";

export const getCollectionPrecompileAddress = (collectionId: number) => {
	const collectionIdBin = (+collectionId).toString(2).padStart(22, "0");
	const parachainIdBin = (100).toString(2).padStart(10, "0");
	const collectionUuid = parseInt(collectionIdBin + parachainIdBin, 2);
	const collectionIdHex = (+collectionUuid).toString(16).padStart(8, "0");
	return getAddress(`0xBBBBBBBB${collectionIdHex.toUpperCase()}000000000000000000000000`);
};

const OWNABLE_ABI = [
	"event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",

	"function owner() public view returns (address)",
	"function renounceOwnership()",
	"function transferOwnership(address owner)",
];

export const ERC1155_PRECOMPILE_ABI = [
	// ERC1155
	"event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
	"event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] balances)",
	"event ApprovalForAll(address indexed account, address indexed operator, bool approved)",

	"function balanceOf(address owner, uint256 id) external view returns (uint256)",
	"function balanceOfBatch(address[] owners, uint256[] ids) external view returns (uint256[] memory)",
	"function setApprovalForAll(address operator, bool approved) external",
	"function isApprovedForAll(address account, address operator) external view returns (bool)",
	"function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external",
	"function safeBatchTransferFrom(address from, address to, uint256[] calldata ids, uint256[] calldata amounts, bytes calldata data) external",

	// Burnable
	"function burn(address account, uint256 id, uint256 value) external",
	"function burnBatch(address account, uint256[] ids, uint256[] values) external",

	// Supply
	"function totalSupply(uint256 id) external view returns (uint256)",
	"function exists(uint256 id) external view returns (bool)",

	// Metadata
	"function uri(uint256 id) external view returns (string memory)",

	// TRN
	"event TokenCreated(uint32 indexed serialNumber)",
	"event MaxSupplyUpdated(uint128 indexed maxSupply)",
	"event BaseURIUpdated(string baseURI)",

	"function createToken(bytes name, uint128 initialIssuance, uint128 maxIssuance, address tokenOwner) external returns (uint32)",
	"function mint(address owner, uint256 id, uint256 amount) external",
	"function mintBatch(address owner, uint256[] ids, uint256[] amounts) external",
	"function setMaxSupply(uint256 id, uint32 maxSupply) external",
	"function setBaseURI(bytes baseURI) external",

	// Ownable
	...OWNABLE_ABI,
];

export const getERC1155Precompile = (
	privateKey: string,
	precompileAddress: string | null,
	collectionId: string | number | null
) => {
	// const provider = getLocalProvider(false).provider;
	const wallet = new Wallet(privateKey, getEthersProvider("porcini"));

	const erc1155PrecompileAddress = precompileAddress
		? precompileAddress
		: getCollectionPrecompileAddress(collectionId as number);

	console.log("erc1155PrecompileAddress:", erc1155PrecompileAddress);
	const erc1155Precompile = new Contract(erc1155PrecompileAddress, ERC1155_PRECOMPILE_ABI, wallet);
	// console.log('erc1155Precompile;:',erc1155Precompile);

	// Create precompiles contract
	return {
		erc1155Precompile,
		wallet,
	};
};

export async function createToken(
	erc1155Precompile: Contract,
	initialIssuance: number,
	tokenOwner: Wallet
) {
	const tokenName = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("MyToken"));
	const maxIssuance = 0;
	const tx = await erc1155Precompile
		.connect(tokenOwner)
		.createToken(tokenName, initialIssuance, maxIssuance, tokenOwner.address);
	const receipt = await tx.wait();
	const serialNumber = (receipt?.events as any)[0].args.serialNumber;
	console.log("serialNumber::", serialNumber);
	return serialNumber;
}

export function getSignerWallet(privateKey: string) {
	return new Wallet(privateKey, getEthersProvider("porcini"));
}
