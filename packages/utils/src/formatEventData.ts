import { EventRecord } from "@polkadot/types/interfaces";

export function formatEventData(
	event: EventRecord["event"]
): Record<string, { type: string; value: unknown }> {
	const data = event.data.toJSON() as unknown[];
	const fields = event.meta.fields.toJSON() as { name: string; typeName: string }[];

	return fields.reduce((record, { name, typeName: type }, index) => {
		record[name] = { value: data[index], type };
		return record;
	}, {} as Record<string, { type: string; value: unknown }>);
}
