import type { Sql } from "postgres";
import type {
	CreateOrderInput,
	ItemRow,
	OrderRow,
	PersonRow,
} from "./order-schema.js";

export class OrderService {
	constructor(private db: Sql) {}

	private async upsertPerson(sql: Sql, name: string) {
		// Schema constraints handle name uniqueness, row lock new/existing person
		const [person] = await sql<PersonRow[]>`
            INSERT INTO persons (name) 
            VALUES (${name})
            ON CONFLICT (name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
            RETURNING id, name
        `;
		return person;
	}

	private async updatePhone(sql: Sql, personId: number, phone: string) {
		// Explicit FOR UPDATE locks aren't necessary here, the unique partial index enforces the constraint
		if (phone) {
			await sql`
				UPDATE person_phones 
				SET is_preferred = FALSE 
				WHERE person_id = ${personId} AND is_preferred = TRUE
			`;
			await sql`
                INSERT INTO person_phones (person_id, phone_number, is_preferred)
                VALUES (${personId}, ${phone}, TRUE)
                ON CONFLICT (person_id, phone_number) 
                DO UPDATE SET is_preferred = TRUE, updated_at = CURRENT_TIMESTAMP
            `;
		}
	}

	private async updateAddress(sql: Sql, personId: number, address: string) {
		// Explicit FOR UPDATE locks aren't necessary here, the unique partial index enforces the constraint
		if (address) {
			await sql`
				UPDATE person_addresses 
				SET is_preferred = FALSE 
				WHERE person_id = ${personId} AND is_preferred = TRUE
			`;
			await sql`
                INSERT INTO person_addresses (person_id, address, is_preferred)
                VALUES (${personId}, ${address}, TRUE)
                ON CONFLICT (person_id, address) 
                DO UPDATE SET is_preferred = TRUE, updated_at = CURRENT_TIMESTAMP
            `;
		}
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

		const isSamePerson = orderData.buyer.name === orderData.recipient.name;
		// Sort by name to ensure consistent lock ordering across persons
		const [firstPerson, secondPerson, isBuyerFirst] =
			orderData.buyer.name <= orderData.recipient.name
				? [orderData.buyer, orderData.recipient, true]
				: [orderData.recipient, orderData.buyer, false];

		return await this.db.begin(async (sql) => {
			const first = await this.upsertPerson(sql, firstPerson.name);
			const second = isSamePerson
				? first
				: await this.upsertPerson(sql, secondPerson.name);

			const buyer = isBuyerFirst ? first : second;
			const recipient = isBuyerFirst ? second : first;
			// One phone/address input per person
			// So, sort persons by id is enough to ensure consistent lock ordering across persons
			const updates = [
				{ person: first, data: firstPerson },
				...(isSamePerson ? [] : [{ person: second, data: secondPerson }]),
			].sort((a, b) => a.person.id - b.person.id);

			for (const { person, data } of updates) {
				if (data.phone) {
					await this.updatePhone(sql, person.id, data.phone);
				}
				if (data.address) {
					await this.updateAddress(sql, person.id, data.address);
				}
			}
			// Sort item ids to ensure consistent lock ordering across items
			const sortedItemIds = [...itemIds].sort((a, b) => a - b);
			// FOR UPDATE lock ensures item prices remain consistent during order creation
			const masterItems = await sql<ItemRow[]>`
				SELECT id, name, price 
				FROM items 
				WHERE id IN ${sql(sortedItemIds)} AND is_active = TRUE
				ORDER BY id
				FOR UPDATE
			`;

			if (masterItems.length !== sortedItemIds.length) {
				const foundIds = new Set(masterItems.map((m) => m.id));
				const missingIds = sortedItemIds.filter((id) => !foundIds.has(id));
				throw new Error(
					`Items not found or inactive: ${missingIds.join(", ")}`,
				);
			}

			let subtotalAmount = 0;

			const masterItemMap = new Map(masterItems.map((m) => [m.id, m]));

			const itemsToInsert = orderData.items.map((reqItem) => {
				const master = masterItemMap.get(reqItem.item_id)!;

				subtotalAmount += master.price * reqItem.quantity;

				return {
					item_id: master.id,
					item_name: master.name,
					item_price: master.price,
					quantity: reqItem.quantity,
				};
			});

			const totalAmount = subtotalAmount + orderData.shipping_cost;
			// Foreign key existence handled by schema constraints
			// delivery_date >= order_date check handled by schema constraints
			// order_number uniqueness handled by schema constraints
			// Non-negative amounts (shipping_cost, subtotal_amount, total_amount) handled by schema constraints
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
