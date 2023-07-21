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
				const api = await getChainApi("porcini");
				setRootApi(api);
			} catch (error) {
				console.log("error on useRootApi", error);
			} finally {
				setIsConnecting(false);
			}
		})();

		return () => {
			rootApi?.disconnect();
		};
	}, []);

	return { rootApi, isConnecting };
};
