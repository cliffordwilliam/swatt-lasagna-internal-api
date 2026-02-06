import type { Sql } from "postgres";
import type { OrderStatusRow } from "./order-status-schema.js";

export class OrderStatusRepository {
	async getAllOrderStatuses(sql: Sql): Promise<OrderStatusRow[]> {
		return await sql<OrderStatusRow[]>`
			SELECT id, name FROM order_statuses
		`;
	}

	async orderStatusExists(sql: Sql, id: number): Promise<boolean> {
		const [result] = await sql<[{ exists: boolean }]>`
			SELECT EXISTS(SELECT 1 FROM order_statuses WHERE id = ${id}) as exists
		`;
		return result.exists;
	}
}
