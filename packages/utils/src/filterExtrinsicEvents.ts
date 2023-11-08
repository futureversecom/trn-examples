import { SubmittableResultValue } from "@polkadot/api/types";
import { EventRecord } from "@polkadot/types/interfaces";
import assert from "node:assert";

import { type EventData, formatEventData } from "./formatEventData";

type EventFilterByName = `${string}.${string}`;
type EventFilterByData = {
	name: `${string}.${string}`;
	key: string;
	data: EventData["x"];
};

type EventFilter = EventFilterByName | EventFilterByData;

/**
 * Filters extrinsic events based on provided event filters.
 *
 * This function filters a list of extrinsic events based on the provided event filters,
 * returning an array of EventRecord objects matching the filter criteria.
 *
 * @param events - An array of extrinsic events to filter.
 * @param eventFilters - An array of EventFilter objects specifying criteria for filtering events.
 * @returns An array of EventRecord objects that match the filter criteria.
 * @throws An assertion error if the input events array is falsy.
 */
export function filterExtrinsicEvents(
	events: SubmittableResultValue["events"],
	eventFilters: EventFilter[]
): EventRecord[] {
	assert(events);

	return eventFilters.map((eventFilter) => {
		const event = events.find(({ event }) => {
			const name = `${event.section[0].toUpperCase() + event.section.slice(1)}.${
				event.method
			}` as `${string}.${string}`;

			if (typeof eventFilter === "string") return name === eventFilter;

			if (name !== eventFilter.name) return;
			const eventData = formatEventData(event);
			return JSON.stringify(eventData[eventFilter.key]) === JSON.stringify(eventFilter.data);
		});

		assert(event);
		return event;
	});
}
