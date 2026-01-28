import type { Sql } from "postgres";
import type {
	AddressRow,
	CreateOrderInput,
	ItemRow,
	OrderDetailRow,
	OrderItemInsert,
	OrderRow,
	PersonRow,
	PhoneRow,
} from "./order-schema.js";

export class OrderRepository {
	async createPerson(sql: Sql, name: string): Promise<PersonRow> {
		const [person] = await sql<PersonRow[]>`
			INSERT INTO persons (name) VALUES (${name}) RETURNING id, name
		`;
		return person!;
	}

	async getPersonById(sql: Sql, id: number): Promise<PersonRow | undefined> {
		const [person] = await sql<PersonRow[]>`
			SELECT id, name FROM persons WHERE id = ${id}
		`;
		return person;
	}

	async getPhoneById(sql: Sql, id: number): Promise<PhoneRow | undefined> {
		const [phone] = await sql<PhoneRow[]>`
			SELECT id, person_id, phone_number FROM person_phones WHERE id = ${id}
		`;
		return phone;
	}

	async createPhone(
		sql: Sql,
		personId: number,
		phoneNumber: string,
	): Promise<PhoneRow> {
		const [phone] = await sql<PhoneRow[]>`
			INSERT INTO person_phones (person_id, phone_number)
			VALUES (${personId}, ${phoneNumber})
			RETURNING id, person_id, phone_number
		`;
		return phone!;
	}

	async getAddressById(sql: Sql, id: number): Promise<AddressRow | undefined> {
		const [address] = await sql<AddressRow[]>`
			SELECT id, person_id, address FROM person_addresses WHERE id = ${id}
		`;
		return address;
	}

	async createAddress(
		sql: Sql,
		personId: number,
		addressValue: string,
	): Promise<AddressRow> {
		const [address] = await sql<AddressRow[]>`
			INSERT INTO person_addresses (person_id, address)
			VALUES (${personId}, ${addressValue})
			RETURNING id, person_id, address
		`;
		return address!;
	}

	async getItemsByIds(sql: Sql, ids: number[]): Promise<ItemRow[]> {
		return await sql<ItemRow[]>`
			SELECT id, name, price
			FROM items
			WHERE id IN ${sql(ids)}
		`;
	}

	async insertOrder(
		sql: Sql,
		orderData: CreateOrderInput,
		orderInsert: {
			buyerId: number;
			buyerName: string;
			buyerPhone: string | null;
			buyerAddress: string | null;
			recipientId: number;
			recipientName: string;
			recipientPhone: string | null;
			recipientAddress: string | null;
			subtotalAmount: number;
			totalAmount: number;
		},
	): Promise<OrderRow> {
		const [order] = await sql<OrderRow[]>`
			INSERT INTO orders (
				order_number,
				order_date,
				delivery_date,
				shipping_cost,
				subtotal_amount,
				total_amount,
				note,
				buyer_id,
				buyer_name,
				buyer_phone,
				buyer_address,
				recipient_id,
				recipient_name,
				recipient_phone,
				recipient_address,
				delivery_method_id,
				payment_method_id,
				order_status_id
			) VALUES (
				${orderData.order_number},
				${orderData.order_date},
				${orderData.delivery_date},
				${orderData.shipping_cost},
				${orderInsert.subtotalAmount},
				${orderInsert.totalAmount},
				${orderData.note ?? null},
				${orderInsert.buyerId},
				${orderInsert.buyerName},
				${orderInsert.buyerPhone},
				${orderInsert.buyerAddress},
				${orderInsert.recipientId},
				${orderInsert.recipientName},
				${orderInsert.recipientPhone},
				${orderInsert.recipientAddress},
				${orderData.delivery_method_id},
				${orderData.payment_method_id},
				${orderData.order_status_id}
			) RETURNING *
		`;
		return order!;
	}

	async insertOrderItems(sql: Sql, items: OrderItemInsert[]): Promise<void> {
		await sql`INSERT INTO order_items ${sql(items)}`;
	}

	async getOrderDetailById(
		sql: Sql,
		orderId: number,
	): Promise<OrderDetailRow | undefined> {
		const [order] = await sql<OrderDetailRow[]>`
			SELECT
				id,
				order_number,
				order_date,
				delivery_date,
				buyer_id,
				buyer_name,
				buyer_phone,
				buyer_address,
				recipient_id,
				recipient_name,
				recipient_phone,
				recipient_address,
				delivery_method_id,
				payment_method_id,
				order_status_id,
				shipping_cost,
				subtotal_amount,
				total_amount,
				note,
				created_at
			FROM orders
			WHERE id = ${orderId}
		`;
		return order;
	}
}
