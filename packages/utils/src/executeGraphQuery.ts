import type { NetworkName } from "@therootnetwork/api";

import { RootNetwork } from "./constants";

export async function executeGraphQuery(
	network: NetworkName,
	query: string,
	variables?: Record<string, unknown>,
	accessToken?: string
) {
	const fetchResponse = await fetch(
		accessToken
			? `https://ap-southeast-2.aws.realm.mongodb.com/api/client/v2.0/app/${RootNetwork[network].MongoAppId}/graphql`
			: `https://rootnet-${network}.hasura.app/v1/graphql`,
		{
			method: "POST",
			body: JSON.stringify({
				query,
				variables,
			}),
			...(accessToken && {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}),
		}
	);

	const data = await fetchResponse.json();

	return data;
}
