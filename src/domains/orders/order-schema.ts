import { type Static, Type } from "@sinclair/typebox";
import type { AddressSummaryRow as AddressRow } from "../addresses/address-schema.js";
import { SearchAddressResultSchema } from "../addresses/address-schema.js";
import type { PersonRow } from "../persons/person-schema.js";
import { PersonSchema } from "../persons/person-schema.js";
import type { PhoneSummaryRow as PhoneRow } from "../phones/phone-schema.js";
import { SearchPhoneResultSchema } from "../phones/phone-schema.js";

export const PhoneInputSchema = Type.Object({
	id: Type.Integer(),
});

export const AddressInputSchema = Type.Object({
	id: Type.Integer(),
});

export const PersonInputSchema = Type.Object({
	id: Type.Integer(),
	phone: PhoneInputSchema,
	address: AddressInputSchema,
});

export const PersonResponseSchema = Type.Object({
	id: Type.Integer(),
	name: Type.String({ minLength: 1, maxLength: 255 }),
	phone: SearchPhoneResultSchema,
	address: SearchAddressResultSchema,
});

export const OrderItemInputSchema = Type.Object({
	item_id: Type.Integer(),
	quantity: Type.Integer({ minimum: 1, maximum: 10000 }),
});

export type OrderItemInput = Static<typeof OrderItemInputSchema>;

export const OrderItemResponseSchema = Type.Object({
	item_id: Type.Integer(),
	item_name: Type.String({ minLength: 1, maxLength: 100 }),
	item_price: Type.Integer({ minimum: 0, maximum: 1000000000 }),
	quantity: Type.Integer({ minimum: 1, maximum: 10000 }),
});

export type OrderItemResponse = Static<typeof OrderItemResponseSchema>;

export const CreateOrderSchema = Type.Object({
	order_number: Type.String({ minLength: 1, maxLength: 50 }),
	order_date: Type.String({ format: "date-time" }),
	delivery_date: Type.String({ format: "date-time" }),
	buyer: PersonInputSchema,
	recipient: PersonInputSchema,
	delivery_method_id: Type.Integer(),
	payment_method_id: Type.Integer(),
	order_status_id: Type.Integer(),
	shipping_cost: Type.Integer({ minimum: 0, maximum: 1000000000 }),
	note: Type.Optional(Type.String({ maxLength: 500 })),
	items: Type.Array(OrderItemInputSchema, { minItems: 1, maxItems: 100 }),
});

export type CreateOrderInput = Static<typeof CreateOrderSchema>;

export const GetOrderResponseSchema = Type.Object({
	order_number: Type.String({ minLength: 1, maxLength: 50 }),
	order_date: Type.String({ format: "date-time" }),
	delivery_date: Type.String({ format: "date-time" }),
	buyer: PersonResponseSchema,
	recipient: PersonResponseSchema,
	delivery_method_id: Type.Integer(),
	payment_method_id: Type.Integer(),
	order_status_id: Type.Integer(),
	shipping_cost: Type.Integer({ minimum: 0, maximum: 1000000000 }),
	note: Type.Optional(Type.String({ maxLength: 500 })),
	items: Type.Array(OrderItemResponseSchema, { minItems: 1, maxItems: 100 }),
});

export type GetOrderResponse = Static<typeof GetOrderResponseSchema>;

export const OrderSchema = Type.Object({
	id: Type.Integer(),
	order_number: Type.String({ minLength: 1, maxLength: 50 }),
	order_date: Type.String({ format: "date-time" }),
	delivery_date: Type.String({ format: "date-time" }),
	buyer_id: Type.Integer(),
	buyer_name: Type.String({ minLength: 1, maxLength: 255 }),
	buyer_phone: Type.Union([Type.String({ maxLength: 25 }), Type.Null()]),
	buyer_address: Type.Union([Type.String({ maxLength: 500 }), Type.Null()]),
	recipient_id: Type.Integer(),
	recipient_name: Type.String({ minLength: 1, maxLength: 255 }),
	recipient_phone: Type.Union([Type.String({ maxLength: 25 }), Type.Null()]),
	recipient_address: Type.Union([Type.String({ maxLength: 500 }), Type.Null()]),
	delivery_method_id: Type.Integer(),
	payment_method_id: Type.Integer(),
	order_status_id: Type.Integer(),
	shipping_cost: Type.Integer({ minimum: 0, maximum: 1000000000 }),
	subtotal_amount: Type.Integer({ minimum: 0, maximum: 1000000000 }),
	total_amount: Type.Integer({ minimum: 0, maximum: 1000000000 }),
	note: Type.Union([Type.String(), Type.Null()]),
	created_at: Type.String({ format: "date-time" }),
	updated_at: Type.String({ format: "date-time" }),
});

export interface OrderRow {
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
	updated_at: Date;
}

export interface OrderItemInsert {
	order_id: number;
	item_id: number;
	item_name: string;
	item_price: number;
	quantity: number;
}

export type OrderItemValues = Omit<OrderItemInsert, "order_id">;

export type PreparedOrderData = {
	buyer: PersonRow;
	recipient: PersonRow;
	buyerPhone: PhoneRow;
	buyerAddress: AddressRow;
	recipientPhone: PhoneRow;
	recipientAddress: AddressRow;
	subtotalAmount: number;
	totalAmount: number;
	itemsToInsert: OrderItemValues[];
};

/** List view: subset of order fields returned by getAllOrders */
export const OrderListSchema = Type.Object({
	id: Type.Integer(),
	order_number: Type.String({ minLength: 1, maxLength: 50 }),
	order_date: Type.String({ format: "date-time" }),
	delivery_date: Type.String({ format: "date-time" }),
	recipient_name: Type.String({ minLength: 1, maxLength: 255 }),
	recipient_address: Type.Union([Type.String({ maxLength: 500 }), Type.Null()]),
	order_status_name: Type.String(),
	total_amount: Type.Integer({ minimum: 0, maximum: 1000000000 }),
});

export const OrdersListSchema = Type.Array(OrderListSchema);

export interface OrderListRow {
	id: number;
	order_number: string;
	order_date: Date;
	delivery_date: Date;
	recipient_name: string;
	recipient_address: string | null;
	order_status_name: string;
	total_amount: number;
}
