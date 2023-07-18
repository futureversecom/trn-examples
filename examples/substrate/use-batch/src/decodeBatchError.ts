import { createKeyring } from "@trne/utils/createKeyring";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getChainApi } from "@trne/utils/getChainApi";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { cleanEnv, str } from "envalid";
import { BN, hexToU8a } from "@polkadot/util";

const env = cleanEnv(process.env, {
  CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

export async function main() {
  const api = await getChainApi("porcini");
  const caller = createKeyring(env.CALLER_PRIVATE_KEY);

  const calls = new Array(10).fill(1).map((n, i) => {
    // Force error as Asset ID 3 does not exist
    if (i === 6) return api.tx.assets.transfer(3, caller.address, 1);
    return api.tx.system.remark(`Call ${n + i}`);
  });
  const extrinsic = api.tx.utility.batch(calls);

  const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
  const [event] = filterExtrinsicEvents(result.events, [
    "Utility.BatchInterrupted",
  ]);

  const {
    event: {
      data: [index, err],
    },
  } = event.toJSON() as {
    event: {
      data: [
        number,
        {
          module: {
            index: number;
            error: `0x${string}`;
          };
        }
      ];
    };
  };

  const { section, name, docs } = api.registry.findMetaError({
    index: new BN(err.module.index),
    error: hexToU8a(err.module.error),
  });
  console.log(
    `Batch interrupted at index ${index}, [${section}.${name}] ${docs}`
  );

  await api.disconnect();
}

main();
