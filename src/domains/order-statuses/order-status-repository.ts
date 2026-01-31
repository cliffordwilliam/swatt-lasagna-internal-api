import type { Sql } from "postgres";
import type { OrderStatusRow } from "./order-status-schema.js";

export class OrderStatusRepository {
	async getAllOrderStatuses(sql: Sql): Promise<OrderStatusRow[]> {
		return await sql<OrderStatusRow[]>`
			SELECT id, name FROM order_statuses
		`;
	}

	async getOrderStatusById(
		sql: Sql,
		id: number,
	): Promise<{ id: number } | undefined> {
		const [status] = await sql<{ id: number }[]>`
			SELECT id FROM order_statuses WHERE id = ${id}
		`;
		return status;
	}
}
