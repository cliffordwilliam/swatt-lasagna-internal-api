import { type Static, Type } from "@sinclair/typebox";

export const CreateItemSchema = Type.Object({
	name: Type.String({ minLength: 1, maxLength: 255 }),
	price: Type.Integer({ minimum: 0, maximum: 1000000000 }),
});

export type CreateItemInput = Static<typeof CreateItemSchema>;

export const ItemSchema = Type.Object({
	id: Type.Integer(),
	name: Type.String({ minLength: 1, maxLength: 255 }),
	price: Type.Integer({ minimum: 0, maximum: 1000000000 }),
	created_at: Type.String({ format: "date-time" }),
	updated_at: Type.String({ format: "date-time" }),
});

export type ItemRow = Static<typeof ItemSchema>;

export const ItemSummarySchema = Type.Object({
	id: Type.Integer(),
	name: Type.String({ minLength: 1, maxLength: 255 }),
	price: Type.Integer({ minimum: 0, maximum: 1000000000 }),
});

export const ItemsSchema = Type.Array(ItemSummarySchema);

export type ItemSummaryRow = Static<typeof ItemSummarySchema>;
