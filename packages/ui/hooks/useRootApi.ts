"use client";

import { useState, useEffect } from "react";
import { getChainApi } from "@trne/utils/src/getChainApi";
import { ApiPromise } from "@polkadot/api";

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
