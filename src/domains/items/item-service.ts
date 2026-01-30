import type { Sql } from "postgres";
import { ConflictError, NotFoundError } from "../../lib/errors.js";
import { ItemRepository } from "./item-repository.js";
import type { CreateItemInput, ItemRow } from "./item-schema.js";

export class ItemService {
	private repo = new ItemRepository();

	constructor(private db: Sql) {}

	async createItem(itemData: CreateItemInput): Promise<ItemRow> {
		return await this.db.begin(async (sql) => {
			await sql`SET TRANSACTION ISOLATION LEVEL READ COMMITTED`;
			await sql`SET LOCAL statement_timeout = '30s'`;

			await this._validateItemNameUniqueness(sql, itemData.name);

			const insertedItem = await this.repo.createItem(
				sql,
				itemData.name,
				itemData.price,
			);

			return insertedItem;
		});
	}

	async putItem(itemData: CreateItemInput, itemId: number): Promise<ItemRow> {
		return await this.db.begin(async (sql) => {
			await sql`SET TRANSACTION ISOLATION LEVEL READ COMMITTED`;
			await sql`SET LOCAL statement_timeout = '30s'`;

			await this._validateItemExists(sql, itemId);
			await this._validateItemNameUniqueness(sql, itemData.name, itemId);

			const updatedItem = await this.repo.updateItem(
				sql,
				itemId,
				itemData.name,
				itemData.price,
			);

			return updatedItem;
		});
	}

	async getAllItems(): Promise<ItemRow[]> {
		return await this.repo.getAllItems(this.db);
	}

	private async _validateItemExists(sql: Sql, itemId: number): Promise<void> {
		const existingItem = await this.repo.getItemById(sql, itemId);
		if (!existingItem) {
			throw new NotFoundError(`Item with id ${itemId} not found`);
		}
	}

	private async _validateItemNameUniqueness(
		sql: Sql,
		itemName: string,
		currentItemId?: number,
	): Promise<void> {
		const existingItem = await this.repo.getItemByName(sql, itemName);
		if (existingItem) {
			if (currentItemId === undefined || existingItem.id !== currentItemId) {
				throw new ConflictError(`Item with name ${itemName} already exists`);
			}
		}
	}
}
