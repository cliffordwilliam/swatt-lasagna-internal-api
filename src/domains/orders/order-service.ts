import type { Sql } from "postgres";
import type {
	CreateOrderInput,
	ItemRow,
	OrderRow,
	PersonRow,
} from "./order-schema.js";

export class OrderService {
	constructor(private db: Sql) {}

	private async upsertPerson(
		sql: Sql,
		name: string,
		phone?: string,
		address?: string,
	) {
		const [person] = await sql<PersonRow[]>`
            INSERT INTO persons (name) 
            VALUES (${name})
            ON CONFLICT (name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
            RETURNING id, name
        `;

		if (phone) {
			await sql`
                UPDATE person_phones 
                SET is_preferred = FALSE 
                WHERE person_id = ${person.id}
				AND is_preferred = TRUE
				AND phone_number != ${phone}
            `;
			await sql`
                INSERT INTO person_phones (person_id, phone_number, is_preferred)
                VALUES (${person.id}, ${phone}, TRUE)
                ON CONFLICT (person_id, phone_number) 
                DO UPDATE SET is_preferred = TRUE, updated_at = CURRENT_TIMESTAMP
            `;
		}

		if (address) {
			await sql`
                UPDATE person_addresses 
                SET is_preferred = FALSE 
                WHERE person_id = ${person.id}
				AND is_preferred = TRUE
				AND address != ${address}
            `;
			await sql`
                INSERT INTO person_addresses (person_id, address, is_preferred)
                VALUES (${person.id}, ${address}, TRUE)
                ON CONFLICT (person_id, address) 
                DO UPDATE SET is_preferred = TRUE, updated_at = CURRENT_TIMESTAMP
            `;
		}

		return person;
	}

	async createOrder(orderData: CreateOrderInput) {
		const itemIds = orderData.items.map((i) => i.item_id);

		if (new Set(itemIds).size !== itemIds.length) {
			throw new Error(
				"Duplicate items detected. Please merge items into a single line.",
			);
		}

		for (const item of orderData.items) {
			if (item.quantity <= 0) {
				throw new Error(
					`Quantity minimum is 1. Invalid quantity ${item.quantity} for item ${item.item_id}`,
				);
			}
		}

		return await this.db.begin(async (sql) => {
			const buyer = await this.upsertPerson(
				sql,
				orderData.buyer.name,
				orderData.buyer.phone,
				orderData.buyer.address,
			);
			const recipient = await this.upsertPerson(
				sql,
				orderData.recipient.name,
				orderData.recipient.phone,
				orderData.recipient.address,
			);

			const sortedItemIds = [...itemIds].sort((a, b) => a - b);

			const masterItems = await sql<ItemRow[]>`
				SELECT id, name, price 
				FROM items 
				WHERE id IN ${sql(sortedItemIds)} AND is_active = TRUE
				ORDER BY id
				FOR UPDATE
			`;

			if (masterItems.length !== itemIds.length) {
				const foundIds = new Set(masterItems.map((m) => m.id));
				const missingIds = itemIds.filter((id) => !foundIds.has(id));
				throw new Error(
					`Items not found or inactive: ${missingIds.join(", ")}`,
				);
			}

			let subtotalAmount = 0;

			const itemsToInsert = orderData.items.map((reqItem) => {
				const master = masterItems.find((m) => m.id === reqItem.item_id)!;
				const price = Number(master.price);

				subtotalAmount += price * reqItem.quantity;

				return {
					item_id: master.id,
					item_name: master.name,
					item_price: price,
					quantity: reqItem.quantity,
				};
			});

			const totalAmount = subtotalAmount + Number(orderData.shipping_cost);

			const [order] = await sql<OrderRow[]>`
                INSERT INTO orders (
                    order_number, 
                    order_date, 
                    delivery_date,
                    buyer_id, 
                    recipient_id,
                    buyer_name,
                    buyer_phone, 
                    buyer_address,
                    recipient_name,
                    recipient_phone, 
                    recipient_address,
                    delivery_method_id, 
                    payment_method_id, 
                    order_status_id,
                    shipping_cost, 
                    subtotal_amount, 
                    total_amount,
                    note
                ) VALUES (
                    ${orderData.order_number}, 
                    ${orderData.order_date}, 
                    ${orderData.delivery_date},
                    ${buyer.id}, 
                    ${recipient.id},
                    ${buyer.name},
                    ${orderData.buyer.phone ?? null}, 
                    ${orderData.buyer.address ?? null},
                    ${recipient.name},
                    ${orderData.recipient.phone ?? null}, 
                    ${orderData.recipient.address ?? null},
                    ${orderData.delivery_method_id}, 
                    ${orderData.payment_method_id}, 
                    ${orderData.order_status_id},
                    ${orderData.shipping_cost}, 
                    ${subtotalAmount}, 
                    ${totalAmount},
                    ${orderData.note ?? null}
                ) RETURNING *
            `;

			const finalItems = itemsToInsert.map((item) => ({
				...item,
				order_id: order.id,
			}));

			await sql`INSERT INTO order_items ${sql(finalItems)}`;

			return order;
		});
	}
}
