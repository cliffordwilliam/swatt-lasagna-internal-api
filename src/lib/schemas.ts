export const IdParamSchema = {
	type: "object",
	properties: {
		id: { type: "number" },
	},
	required: ["id"],
} as const;
