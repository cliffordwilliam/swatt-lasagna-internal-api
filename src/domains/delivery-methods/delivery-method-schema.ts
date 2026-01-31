import { type Static, Type } from "@sinclair/typebox";

export const DeliveryMethodSchema = Type.Object({
	id: Type.Integer(),
	name: Type.String(),
});

export const DeliveryMethodsSchema = Type.Array(DeliveryMethodSchema);

export type DeliveryMethodRow = Static<typeof DeliveryMethodSchema>;
