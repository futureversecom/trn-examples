import { SubmittableResultValue } from "@polkadot/api/types";
import { EventRecord } from "@polkadot/types/interfaces";
import assert from "assert";

export function filterExtrinsicEvents(
	events: SubmittableResultValue["events"],
	eventNames: `${string}.${string}`[]
): EventRecord[] {
	assert(events);

	return eventNames.map((eventName) => {
		const event = events.find(({ event }) => {
			const name = `${event.section[0].toUpperCase() + event.section.slice(1)}.${
				event.method
			}` as `${string}.${string}`;

			return name === eventName;
		});

		assert(event);
		return event;
	});
}
