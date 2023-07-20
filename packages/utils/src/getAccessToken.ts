import type { NetworkName } from "@therootnetwork/api";
import { App, Credentials } from "realm-web";

import { RootNetwork } from "./constants";

export async function getAccessToken(network: NetworkName) {
	const app = new App({
		id: RootNetwork[network].MongoAppId,
	});

	await app.logIn(Credentials.anonymous());

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return app.currentUser!.accessToken!;
}
