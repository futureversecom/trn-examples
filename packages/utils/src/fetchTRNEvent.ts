import type { NetworkName } from "@therootnetwork/api";

import { executeGraphQuery } from "./executeGraphQuery";
import { getAccessToken } from "./getAccessToken";

interface TRNEvent {
	eventId: string;
	eventInfo: {
		source: string;
		destination: string;
		message: string;
	};
	eventSignature: {
		v: Array<string>;
		r: Array<string>;
		s: Array<string>;
	};
	eventAuthSetId: {
		setId: string;
		setValue: Array<string>;
	};
}

const GetETHWithdrawalByExtrinsicId = `
query GetETHWithdrawalByExtrinsicId($extrinsicId: String!) {
  ethWithdrawals(query: { extrinsicId: $extrinsicId }) {
    eventId
    eventInfo {
      source
      destination
      message
    }
    eventSignature {
      v
      r
      s
    }
    eventAuthSetId {
      setId
      setValue
    }
  }
}
`;

export async function fetchTRNEvent(network: NetworkName, extrinsicId: string): Promise<TRNEvent> {
	return new Promise((resolve, reject) => {
		getAccessToken(network).then((accessToken) => {
			executeGraphQuery(network, GetETHWithdrawalByExtrinsicId, { extrinsicId }, accessToken).then(
				({ data, errors }) => {
					if (errors) reject(errors[0]);

					const rootEventArray = data?.ethWithdrawals;
					if (!Array.isArray(rootEventArray) || !rootEventArray?.length)
						return setTimeout(() => fetchTRNEvent(network, extrinsicId).then(resolve), 5000);

					resolve(rootEventArray[0]);
				}
			);
		});
	});
}
