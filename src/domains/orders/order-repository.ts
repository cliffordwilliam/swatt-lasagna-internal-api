import type { Sql } from "postgres";
import type {
	CreateOrderInput,
	OrderItemInsert,
	OrderItemResponse,
	OrderListRow,
	OrderWithRelatedNoItems,
	PreparedOrderData,
} from "./order-schema.js";

export class OrderRepository {
	async insertOrder(
		sql: Sql,
		orderData: CreateOrderInput,
		PreparedOrderData: PreparedOrderData,
	): Promise<{ id: number }> {
		const [order] = await sql<[{ id: number }]>`
			INSERT INTO orders (
				order_number,
				order_date,
				delivery_date,
				shipping_cost,
				subtotal_amount,
				total_amount,
				note,
				buyer_id,
				buyer_name,
				buyer_phone,
				buyer_address,
				recipient_id,
				recipient_name,
				recipient_phone,
				recipient_address,
				delivery_method_id,
				payment_method_id,
				order_status_id
			) VALUES (
				${orderData.order_number},
				${orderData.order_date},
				${orderData.delivery_date},
				${orderData.shipping_cost},
				${PreparedOrderData.subtotalAmount},
				${PreparedOrderData.totalAmount},
				${orderData.note ?? null},
				${PreparedOrderData.buyer.id},
				${PreparedOrderData.buyer.name},
				${PreparedOrderData.buyerPhone.phone_number},
				${PreparedOrderData.buyerAddress.address},
				${PreparedOrderData.recipient.id},
				${PreparedOrderData.recipient.name},
				${PreparedOrderData.recipientPhone.phone_number},
				${PreparedOrderData.recipientAddress.address},
				${orderData.delivery_method_id},
				${orderData.payment_method_id},
				${orderData.order_status_id}
			) RETURNING id
		`;
		return order!;
	}

	async updateOrder(
		sql: Sql,
		orderId: number,
		orderData: CreateOrderInput,
		preparedOrderData: PreparedOrderData,
	): Promise<void> {
		await sql`
			UPDATE orders SET
				order_number = ${orderData.order_number},
				order_date = ${orderData.order_date},
				delivery_date = ${orderData.delivery_date},
				shipping_cost = ${orderData.shipping_cost},
				subtotal_amount = ${preparedOrderData.subtotalAmount},
				total_amount = ${preparedOrderData.totalAmount},
				note = ${orderData.note ?? null},
				buyer_id = ${preparedOrderData.buyer.id},
				buyer_name = ${preparedOrderData.buyer.name},
				buyer_phone = ${preparedOrderData.buyerPhone.phone_number},
				buyer_address = ${preparedOrderData.buyerAddress.address},
				recipient_id = ${preparedOrderData.recipient.id},
				recipient_name = ${preparedOrderData.recipient.name},
				recipient_phone = ${preparedOrderData.recipientPhone.phone_number},
				recipient_address = ${preparedOrderData.recipientAddress.address},
				delivery_method_id = ${orderData.delivery_method_id},
				payment_method_id = ${orderData.payment_method_id},
				order_status_id = ${orderData.order_status_id},
				updated_at = NOW()
			WHERE id = ${orderId}
		`;
	}

	async insertOrderItems(sql: Sql, items: OrderItemInsert[]): Promise<void> {
		await sql`INSERT INTO order_items ${sql(items)}`;
	}

	async deleteOrderItems(sql: Sql, orderId: number): Promise<void> {
		await sql`DELETE FROM order_items WHERE order_id = ${orderId}`;
	}

	async getOrderById(
		sql: Sql,
		orderId: number,
	): Promise<{ id: number } | undefined> {
		const [order] = await sql<{ id: number }[]>`
			SELECT id FROM orders WHERE id = ${orderId}
		`;
		return order;
	}

	async orderNumberExists(
		sql: Sql,
		orderNumber: string,
		excludeOrderId?: number,
	): Promise<boolean> {
		if (excludeOrderId !== undefined) {
			const [result] = await sql<[{ exists: boolean }]>`
				SELECT EXISTS(
					SELECT 1 FROM orders
					WHERE order_number = ${orderNumber} AND id != ${excludeOrderId}
				) as exists
			`;
			return result.exists;
		}
		const [result] = await sql<[{ exists: boolean }]>`
			SELECT EXISTS(SELECT 1 FROM orders WHERE order_number = ${orderNumber}) as exists
		`;
		return result.exists;
	}

	async getAllOrders(sql: Sql): Promise<OrderListRow[]> {
		return await sql<OrderListRow[]>`
			SELECT
				orders.id,
				orders.order_number,
				orders.order_date,
				orders.delivery_date,
				orders.recipient_name,
				orders.recipient_address,
				order_statuses.name as order_status_name,
				orders.total_amount
			FROM orders
			JOIN order_statuses ON orders.order_status_id = order_statuses.id
		`;
	}

	async getOrderItemsByOrderId(
		sql: Sql,
		orderId: number,
	): Promise<OrderItemResponse[]> {
		return await sql<OrderItemResponse[]>`
			SELECT item_id, item_name, item_price, quantity
			FROM order_items
			WHERE order_id = ${orderId}
		`;
	}

	async getOrderWithRelatedDataById(
		sql: Sql,
		orderId: number,
	): Promise<OrderWithRelatedNoItems | undefined> {
		const [row] = await sql<OrderWithRelatedNoItems[]>`
			SELECT
				o.order_number,
				o.order_date,
				o.delivery_date,
				o.delivery_method_id,
				o.payment_method_id,
				o.order_status_id,
				o.shipping_cost,
				o.note,
				buyer.id AS buyer_id,
				buyer.name AS buyer_name,
				buyer_pp.id AS buyer_phone_id,
				buyer_pp.phone_number AS buyer_phone_number,
				buyer_pa.id AS buyer_address_id,
				buyer_pa.address AS buyer_address_value,
				recipient.id AS recipient_id,
				recipient.name AS recipient_name,
				recipient_pp.id AS recipient_phone_id,
				recipient_pp.phone_number AS recipient_phone_number,
				recipient_pa.id AS recipient_address_id,
				recipient_pa.address AS recipient_address_value
			FROM orders o
			JOIN persons buyer ON buyer.id = o.buyer_id
			JOIN persons recipient ON recipient.id = o.recipient_id
			JOIN person_phones buyer_pp
				ON buyer_pp.person_id = o.buyer_id
				AND buyer_pp.phone_number IS NOT DISTINCT FROM o.buyer_phone
			JOIN person_addresses buyer_pa
				ON buyer_pa.person_id = o.buyer_id
				AND buyer_pa.address IS NOT DISTINCT FROM o.buyer_address
			JOIN person_phones recipient_pp
				ON recipient_pp.person_id = o.recipient_id
				AND recipient_pp.phone_number IS NOT DISTINCT FROM o.recipient_phone
			JOIN person_addresses recipient_pa
				ON recipient_pa.person_id = o.recipient_id
				AND recipient_pa.address IS NOT DISTINCT FROM o.recipient_address
			WHERE o.id = ${orderId}
		`;
		return row;
	}
}
