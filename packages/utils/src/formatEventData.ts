import { EventRecord } from "@polkadot/types/interfaces";

export type EventData = Record<string, { type: string; value: unknown }>;

/**
 * Formats raw event data into a structured EventData object.
 *
 * @param event - The raw event data to format.
 * @returns An EventData object containing the formatted event data.
 */
export function formatEventData(event: EventRecord["event"]): EventData {
	const data = event.data.toJSON() as unknown[];
	const fields = event.meta.fields.toJSON() as { name: string; typeName: string }[];

	return fields.reduce((record, { name, typeName: type }, index) => {
		record[name] = { value: data[index], type };
		return record;
	}, {} as EventData);
}
