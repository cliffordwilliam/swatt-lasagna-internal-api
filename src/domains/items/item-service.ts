import type { Sql } from "postgres";
import { ConflictError, NotFoundError } from "../../lib/errors.js";
import { normalizeNameForDb } from "../../lib/string-utils.js";
import { ItemRepository } from "./item-repository.js";
import type { CreateItemInput, ItemSummaryRow } from "./item-schema.js";

export class ItemService {
	private repo = new ItemRepository();

	constructor(private db: Sql) {}

	async createItem(itemData: CreateItemInput): Promise<void> {
		const normalizedName = normalizeNameForDb(itemData.name);
		await this._validateItemNameUniqueness(this.db, normalizedName);
		await this.repo.createItem(this.db, normalizedName, itemData.price);
	}

	async putItem(itemData: CreateItemInput, itemId: number): Promise<void> {
		await this._validateItemExists(this.db, itemId);
		const normalizedName = normalizeNameForDb(itemData.name);
		await this._validateItemNameUniqueness(this.db, normalizedName, itemId);
		await this.repo.updateItem(this.db, itemId, normalizedName, itemData.price);
	}

	async getAllItems(): Promise<ItemSummaryRow[]> {
		return await this.repo.getAllItems(this.db);
	}

	async getItemById(itemId: number): Promise<ItemSummaryRow> {
		const item = await this.repo.getItemById(this.db, itemId);
		if (!item) {
			throw new NotFoundError(`Item with id ${itemId} not found`);
		}
		return item;
	}

	private async _validateItemExists(sql: Sql, itemId: number): Promise<void> {
		const exists = await this.repo.itemExists(sql, itemId);
		if (!exists) {
			throw new NotFoundError(`Item with id ${itemId} not found`);
		}
	}

	private async _validateItemNameUniqueness(
		sql: Sql,
		itemName: string,
		currentItemId?: number,
	): Promise<void> {
		const exists = await this.repo.itemNameExists(sql, itemName, currentItemId);
		if (exists) {
			throw new ConflictError(`Item with name ${itemName} already exists`);
		}
	}
}
