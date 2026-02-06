import { type Static, Type } from "@sinclair/typebox";

const DeliveryMethodSchema = Type.Object({
	id: Type.Integer(),
	name: Type.String(),
});

export const DeliveryMethodsSchema = Type.Array(DeliveryMethodSchema);

export type DeliveryMethodRow = Static<typeof DeliveryMethodSchema>;
