import type { Sql } from "postgres";
import type { ItemRow } from "./item-schema.js";

export class ItemRepository {
	async createItem(sql: Sql, name: string, price: number): Promise<ItemRow> {
		const [item] = await sql<ItemRow[]>`
			INSERT INTO items (name, price) VALUES (${name}, ${price})
			RETURNING id, name, price, created_at, updated_at
		`;
		return item!;
	}

	async getAllItems(sql: Sql): Promise<ItemRow[]> {
		return await sql<ItemRow[]>`
			SELECT id, name, price, created_at, updated_at FROM items
		`;
	}

	async getItemById(sql: Sql, id: number): Promise<ItemRow | undefined> {
		const [item] = await sql<ItemRow[]>`
			SELECT id, name, price, created_at, updated_at FROM items WHERE id = ${id}
		`;
		return item;
	}

	async getItemsByIds(sql: Sql, ids: number[]): Promise<ItemRow[]> {
		return await sql<ItemRow[]>`
			SELECT id, name, price, created_at, updated_at
			FROM items
			WHERE id IN ${sql(ids)}
		`;
	}

	async getItemByName(sql: Sql, name: string): Promise<ItemRow | undefined> {
		const [item] = await sql<ItemRow[]>`
			SELECT id, name, price, created_at, updated_at FROM items WHERE name = ${name}
		`;
		return item;
	}

	async updateItem(
		sql: Sql,
		id: number,
		name: string,
		price: number,
	): Promise<ItemRow> {
		const [item] = await sql<ItemRow[]>`
			UPDATE items SET name = ${name}, price = ${price}, updated_at = NOW()
			WHERE id = ${id}
			RETURNING id, name, price, created_at, updated_at
		`;
		return item!;
	}
}
