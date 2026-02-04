import type { Sql } from "postgres";
import type { ItemSummaryRow } from "./item-schema.js";

export class ItemRepository {
	async createItem(sql: Sql, name: string, price: number): Promise<void> {
		await sql`
			INSERT INTO items (name, price) VALUES (${name}, ${price})
		`;
	}

	async getAllItems(sql: Sql): Promise<ItemSummaryRow[]> {
		return await sql<ItemSummaryRow[]>`
			SELECT id, name, price FROM items
		`;
	}

	async getItemById(sql: Sql, id: number): Promise<ItemSummaryRow | undefined> {
		const [item] = await sql<ItemSummaryRow[]>`
			SELECT id, name, price FROM items WHERE id = ${id}
		`;
		return item;
	}

	async getItemsByIds(sql: Sql, ids: number[]): Promise<ItemSummaryRow[]> {
		return await sql<ItemSummaryRow[]>`
			SELECT id, name, price
			FROM items
			WHERE id IN ${sql(ids)}
		`;
	}

	async updateItem(
		sql: Sql,
		id: number,
		name: string,
		price: number,
	): Promise<void> {
		await sql`
			UPDATE items SET name = ${name}, price = ${price}
			WHERE id = ${id}
		`;
	}

	async itemExists(sql: Sql, id: number): Promise<boolean> {
		const [result] = await sql<[{ exists: boolean }]>`
			SELECT EXISTS(SELECT 1 FROM items WHERE id = ${id}) as exists
		`;
		return result.exists;
	}

	async itemNameExists(
		sql: Sql,
		name: string,
		excludeItemId?: number,
	): Promise<boolean> {
		if (excludeItemId !== undefined) {
			const [result] = await sql<[{ exists: boolean }]>`
				SELECT EXISTS(
					SELECT 1 FROM items
					WHERE name = ${name} AND id != ${excludeItemId}
				) as exists
			`;
			return result.exists;
		}
		const [result] = await sql<[{ exists: boolean }]>`
			SELECT EXISTS(SELECT 1 FROM items WHERE name = ${name}) as exists
		`;
		return result.exists;
	}
}
