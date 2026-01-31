import { type Static, Type } from "@sinclair/typebox";

export const PaymentMethodSchema = Type.Object({
	id: Type.Integer(),
	name: Type.String(),
});

export const PaymentMethodsSchema = Type.Array(PaymentMethodSchema);

export type PaymentMethodRow = Static<typeof PaymentMethodSchema>;
