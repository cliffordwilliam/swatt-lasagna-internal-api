import { type Static, Type } from "@sinclair/typebox";
import type { AddressSummaryRow as AddressRow } from "../addresses/address-schema.js";
import { SearchAddressResultSchema } from "../addresses/address-schema.js";
import type { PersonRow } from "../persons/person-schema.js";
import type { PhoneSummaryRow as PhoneRow } from "../phones/phone-schema.js";
import { SearchPhoneResultSchema } from "../phones/phone-schema.js";

const PersonInputSchema = Type.Object({
	id: Type.Integer(),
	phone: Type.Object({ id: Type.Integer() }),
	address: Type.Object({ id: Type.Integer() }),
});

const PersonResponseSchema = Type.Object({
	id: Type.Integer(),
	name: Type.String({ minLength: 1, maxLength: 255 }),
	phone: SearchPhoneResultSchema,
	address: SearchAddressResultSchema,
});

const OrderItemInputSchema = Type.Object({
	item_id: Type.Integer(),
	quantity: Type.Integer({ minimum: 1, maximum: 10000 }),
});

export type OrderItemInput = Static<typeof OrderItemInputSchema>;

const OrderItemResponseSchema = Type.Object({
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

const OrderListSchema = Type.Object({
	id: Type.Integer(),
	order_number: Type.String({ minLength: 1, maxLength: 50 }),
	order_date: Type.String({ format: "date-time" }),
	delivery_date: Type.String({ format: "date-time" }),
	recipient_name: Type.String({ minLength: 1, maxLength: 255 }),
	recipient_address: Type.String({ maxLength: 500 }),
	order_status_name: Type.String(),
	total_amount: Type.Integer({ minimum: 0, maximum: 1000000000 }),
});

export const OrdersListSchema = Type.Array(OrderListSchema);

export const ListOrdersQuerySchema = Type.Object({
	order_date_from: Type.Optional(Type.String({ format: "date-time" })),
	order_date_to: Type.Optional(Type.String({ format: "date-time" })),
	order_status_id: Type.Optional(Type.Integer()),
	order_number: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
});

export type ListOrdersQuery = Static<typeof ListOrdersQuerySchema>;

export interface OrderListRow {
	id: number;
	order_number: string;
	order_date: Date;
	delivery_date: Date;
	recipient_name: string;
	recipient_address: string;
	order_status_name: string;
	total_amount: number;
}

export interface GetOrderWithRelatedDataRow {
	order_number: string;
	order_date: Date;
	delivery_date: Date;
	delivery_method_id: number;
	payment_method_id: number;
	order_status_id: number;
	shipping_cost: number;
	note: string | null;
	buyer_id: number;
	buyer_name: string;
	buyer_phone_id: number;
	buyer_phone_number: string;
	buyer_address_id: number;
	buyer_address_value: string;
	recipient_id: number;
	recipient_name: string;
	recipient_phone_id: number;
	recipient_phone_number: string;
	recipient_address_id: number;
	recipient_address_value: string;
	items: Array<{
		item_id: number;
		item_name: string;
		item_price: number;
		quantity: number;
	}>;
}

export type OrderWithRelatedNoItems = Omit<GetOrderWithRelatedDataRow, "items">;
