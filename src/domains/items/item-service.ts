import type { Sql } from "postgres";
import { ConflictError, NotFoundError } from "../../lib/errors.js";
import { ItemRepository } from "./item-repository.js";
import type {
	CreateItemInput,
	ItemRow,
	ItemSummaryRow,
} from "./item-schema.js";

export class ItemService {
	private repo = new ItemRepository();

	constructor(private db: Sql) {}

	async createItem(itemData: CreateItemInput): Promise<ItemRow> {
		await this._validateItemNameUniqueness(this.db, itemData.name);

		const insertedItem = await this.repo.createItem(
			this.db,
			itemData.name,
			itemData.price,
		);

		return insertedItem;
	}

	async putItem(itemData: CreateItemInput, itemId: number): Promise<ItemRow> {
		await this._validateItemExists(this.db, itemId);
		await this._validateItemNameUniqueness(this.db, itemData.name, itemId);

		const updatedItem = await this.repo.updateItem(
			this.db,
			itemId,
			itemData.name,
			itemData.price,
		);

		return updatedItem;
	}

	async getAllItems(): Promise<ItemSummaryRow[]> {
		return await this.repo.getAllItems(this.db);
	}

	async getItemById(itemId: number): Promise<ItemSummaryRow> {
		const item = await this.repo.getItemById(this.db, itemId);
		if (!item) {
			throw new NotFoundError(`Item with id ${itemId} not found`);
		}
		return { id: item.id, name: item.name, price: item.price };
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
