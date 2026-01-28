import { type Static, Type } from "@sinclair/typebox";

export const PhoneInputSchema = Type.Union([
	Type.Object({
		id: Type.Number(),
	}),
	Type.Object({
		value: Type.String({ minLength: 1, maxLength: 25 }),
	}),
]);

export const AddressInputSchema = Type.Union([
	Type.Object({
		id: Type.Number(),
	}),
	Type.Object({
		value: Type.String({ minLength: 1 }),
	}),
]);

export const PersonInputSchema = Type.Union([
	Type.Object({
		id: Type.Number(),
		phone: Type.Optional(PhoneInputSchema),
		address: Type.Optional(AddressInputSchema),
	}),
	Type.Object({
		name: Type.String({ minLength: 1, maxLength: 255 }),
		phone: Type.Optional(PhoneInputSchema),
		address: Type.Optional(AddressInputSchema),
	}),
]);

export const OrderItemInputSchema = Type.Object({
	item_id: Type.Number(),
	quantity: Type.Number({ minimum: 1 }),
});

export const CreateOrderSchema = Type.Object({
	order_number: Type.String({ minLength: 1 }),
	order_date: Type.String({ format: "date-time" }),
	delivery_date: Type.String({ format: "date-time" }),
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

export const OrderDetailSchema = Type.Object({
	id: Type.Number(),
	order_number: Type.String({ minLength: 1 }),
	order_date: Type.String({ format: "date-time" }),
	delivery_date: Type.String({ format: "date-time" }),
	buyer_id: Type.Number(),
	buyer_name: Type.String({ minLength: 1, maxLength: 255 }),
	buyer_phone: Type.Union([Type.String({ maxLength: 25 }), Type.Null()]),
	buyer_address: Type.Union([Type.String(), Type.Null()]),
	recipient_id: Type.Number(),
	recipient_name: Type.String({ minLength: 1, maxLength: 255 }),
	recipient_phone: Type.Union([Type.String({ maxLength: 25 }), Type.Null()]),
	recipient_address: Type.Union([Type.String(), Type.Null()]),
	delivery_method_id: Type.Number(),
	payment_method_id: Type.Number(),
	order_status_id: Type.Number(),
	shipping_cost: Type.Number({ minimum: 0 }),
	subtotal_amount: Type.Number({ minimum: 0 }),
	total_amount: Type.Number({ minimum: 0 }),
	note: Type.Union([Type.String(), Type.Null()]),
	created_at: Type.String({ format: "date-time" }),
});

export type OrderDetail = Static<typeof OrderDetailSchema>;

export interface OrderDetailRow {
	id: number;
	order_number: string;
	order_date: Date;
	delivery_date: Date;
	buyer_id: number;
	buyer_name: string;
	buyer_phone: string | null;
	buyer_address: string | null;
	recipient_id: number;
	recipient_name: string;
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
	id: number;
	order_number: string;
	order_date: Date;
	delivery_date: Date;
	shipping_cost: number;
	subtotal_amount: number;
	total_amount: number;
	note: string | null;
	buyer_id: number;
	buyer_name: string;
	buyer_phone: string | null;
	buyer_address: string | null;
	recipient_id: number;
	recipient_name: string;
	recipient_phone: string | null;
	recipient_address: string | null;
	delivery_method_id: number;
	payment_method_id: number;
	order_status_id: number;
	created_at: Date;
	updated_at: Date;
}

export interface PhoneRow {
	id: number;
	person_id: number;
	phone_number: string;
}

export interface AddressRow {
	id: number;
	person_id: number;
	address: string;
}

export interface OrderItemInsert {
	order_id: number;
	item_id: number;
	item_name: string;
	item_price: number;
	quantity: number;
}
