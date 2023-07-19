"use client";

import { ApiPromise } from "@polkadot/api";
import { getChainApi } from "@trne/utils/src/getChainApi";
import { useEffect, useState } from "react";

export const useRootApi = () => {
	const [rootApi, setRootApi] = useState<ApiPromise>();
	const [isConnecting, setIsConnecting] = useState(false);

	useEffect(() => {
		(async function () {
			try {
				setIsConnecting(true);
				const rootApi = await getChainApi("porcini");
				setRootApi(rootApi);
			} catch (error) {
				console.log("error on useRootApi", error);
			} finally {
				setIsConnecting(false);
			}
		})();
	}, []);

	return { rootApi, isConnecting };
};
