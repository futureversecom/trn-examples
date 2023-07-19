import assert from "assert";

export function collectArrayFromString(arrayString: string): Array<string> {
	const match = arrayString.match(/\[(.*?)\]/)?.[1];
	assert(match, "Invalid array string");

	return match.split(",");
}
