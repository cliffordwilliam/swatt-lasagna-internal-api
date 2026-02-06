import { type Static, Type } from "@sinclair/typebox";

const OrderStatusSchema = Type.Object({
	id: Type.Integer(),
	name: Type.String(),
});

export const OrderStatusesSchema = Type.Array(OrderStatusSchema);

export type OrderStatusRow = Static<typeof OrderStatusSchema>;
