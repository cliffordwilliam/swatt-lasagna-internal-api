import { type Static, Type } from "@sinclair/typebox";

export const PersonInputSchema = Type.Object({
	name: Type.String({ minLength: 1 }),
	phone: Type.Optional(Type.String()),
	address: Type.Optional(Type.String()),
});

export const OrderItemInputSchema = Type.Object({
	item_id: Type.Number(),
	quantity: Type.Number({ minimum: 1 }),
});

export const CreateOrderSchema = Type.Object({
	order_number: Type.String({ minLength: 1 }),
	order_date: Type.String({ format: "date" }),
	delivery_date: Type.String({ format: "date" }),
	buyer: PersonInputSchema,
	recipient: PersonInputSchema,
	delivery_method_id: Type.Number(),
	payment_method_id: Type.Number(),
	order_status_id: Type.Number(),
	shipping_cost: Type.Number({ minimum: 0 }),
	note: Type.Optional(Type.String()),
	items: Type.Array(OrderItemInputSchema, { minItems: 1 }),
});

export type CreateOrderInput = Static<typeof CreateOrderSchema>;

const PersonResponseSchema = Type.Object({
	id: Type.Number(),
	name: Type.String(),
	phone: Type.Union([Type.String(), Type.Null()]),
	address: Type.Union([Type.String(), Type.Null()]),
});

const ReferenceDataSchema = Type.Object({
	id: Type.Number(),
	name: Type.String(),
});

const OrderItemResponseSchema = Type.Object({
	id: Type.Number(),
	item_id: Type.Number(),
	item_name: Type.String(),
	item_price: Type.Number(),
	quantity: Type.Number(),
	line_total: Type.Number(),
});

export const OrderDetailSchema = Type.Object({
	id: Type.Number(),
	order_number: Type.String(),
	order_date: Type.String(),
	delivery_date: Type.String(),
	buyer: PersonResponseSchema,
	recipient: PersonResponseSchema,
	delivery_method: ReferenceDataSchema,
	payment_method: ReferenceDataSchema,
	order_status: ReferenceDataSchema,
	shipping_cost: Type.Number(),
	subtotal_amount: Type.Number(),
	total_amount: Type.Number(),
	note: Type.Union([Type.String(), Type.Null()]),
	items: Type.Array(OrderItemResponseSchema),
	created_at: Type.String(),
});

export interface PersonRow {
	id: number;
	name: string;
}

export interface ItemRow {
	id: number;
	name: string;
	price: number;
}

export interface OrderRow {
	id: string;
	order_number: string;
	order_date: Date;
	delivery_date: Date;
	buyer_id: number;
	buyer_phone: string | null;
	buyer_address: string | null;
	recipient_id: number;
	recipient_phone: string | null;
	recipient_address: string | null;
	delivery_method_id: number;
	payment_method_id: number;
	order_status_id: number;
	shipping_cost: number;
	subtotal_amount: number;
	total_amount: number;
	note: string | null;
	created_at: Date;
}
