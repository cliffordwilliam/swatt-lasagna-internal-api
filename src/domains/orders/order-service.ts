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
                INSERT INTO person_phones (person_id, phone_number, is_preferred)
                VALUES (${person.id}, ${phone}, TRUE)
                ON CONFLICT (person_id, phone_number) 
                DO UPDATE SET is_preferred = TRUE, updated_at = CURRENT_TIMESTAMP
            `;
			await sql`
                UPDATE person_phones 
                SET is_preferred = FALSE 
                WHERE person_id = ${person.id} AND phone_number != ${phone}
            `;
		}

		if (address) {
			await sql`
                INSERT INTO person_addresses (person_id, address, is_preferred)
                VALUES (${person.id}, ${address}, TRUE)
                ON CONFLICT (person_id, address) 
                DO UPDATE SET is_preferred = TRUE, updated_at = CURRENT_TIMESTAMP
            `;
			await sql`
                UPDATE person_addresses 
                SET is_preferred = FALSE 
                WHERE person_id = ${person.id} AND address != ${address}
            `;
		}

		return person;
	}

	async createOrder(orderData: CreateOrderInput) {
		const inputItemIds = orderData.items.map((i) => i.item_id);
		if (new Set(inputItemIds).size !== inputItemIds.length) {
			throw new Error(
				"Duplicate items detected. Please merge items into a single line.",
			);
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

			const uniqueItemIds = [...new Set(inputItemIds)];

			const masterItems = await sql<ItemRow[]>`
                SELECT id, name, price 
                FROM items 
                WHERE id IN ${sql(uniqueItemIds)} AND is_active = TRUE
            `;

			if (masterItems.length !== uniqueItemIds.length) {
				throw new Error("One or more items are invalid or inactive.");
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
