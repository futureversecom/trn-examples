import pino from "pino";

export type Logger = ReturnType<typeof getLogger>;

export function getLogger() {
	return pino({
		transport: {
			target: "pino-pretty",
		},
	});
}
