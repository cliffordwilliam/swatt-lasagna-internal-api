import type { Sql } from "postgres";
import type {
	CreateOrderInput,
	OrderItemInsert,
	OrderListRow,
	OrderRow,
} from "./order-schema.js";

export class OrderRepository {
	async insertOrder(
		sql: Sql,
		orderData: CreateOrderInput,
		orderInsert: {
			buyerId: number;
			buyerName: string;
			buyerPhone: string | null;
			buyerAddress: string | null;
			recipientId: number;
			recipientName: string;
			recipientPhone: string | null;
			recipientAddress: string | null;
			subtotalAmount: number;
			totalAmount: number;
		},
	): Promise<OrderRow> {
		const [order] = await sql<OrderRow[]>`
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
				${orderInsert.subtotalAmount},
				${orderInsert.totalAmount},
				${orderData.note ?? null},
				${orderInsert.buyerId},
				${orderInsert.buyerName},
				${orderInsert.buyerPhone},
				${orderInsert.buyerAddress},
				${orderInsert.recipientId},
				${orderInsert.recipientName},
				${orderInsert.recipientPhone},
				${orderInsert.recipientAddress},
				${orderData.delivery_method_id},
				${orderData.payment_method_id},
				${orderData.order_status_id}
			) RETURNING
				id,
				order_number,
				order_date,
				delivery_date,
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
				order_status_id,
				shipping_cost,
				subtotal_amount,
				total_amount,
				note,
				created_at,
				updated_at
		`;
		return order!;
	}

	async updateOrder(
		sql: Sql,
		orderId: number,
		orderData: CreateOrderInput,
		orderUpdate: {
			buyerId: number;
			buyerName: string;
			buyerPhone: string | null;
			buyerAddress: string | null;
			recipientId: number;
			recipientName: string;
			recipientPhone: string | null;
			recipientAddress: string | null;
			subtotalAmount: number;
			totalAmount: number;
		},
	): Promise<OrderRow> {
		const [order] = await sql<OrderRow[]>`
			UPDATE orders SET
				order_number = ${orderData.order_number},
				order_date = ${orderData.order_date},
				delivery_date = ${orderData.delivery_date},
				shipping_cost = ${orderData.shipping_cost},
				subtotal_amount = ${orderUpdate.subtotalAmount},
				total_amount = ${orderUpdate.totalAmount},
				note = ${orderData.note ?? null},
				buyer_id = ${orderUpdate.buyerId},
				buyer_name = ${orderUpdate.buyerName},
				buyer_phone = ${orderUpdate.buyerPhone},
				buyer_address = ${orderUpdate.buyerAddress},
				recipient_id = ${orderUpdate.recipientId},
				recipient_name = ${orderUpdate.recipientName},
				recipient_phone = ${orderUpdate.recipientPhone},
				recipient_address = ${orderUpdate.recipientAddress},
				delivery_method_id = ${orderData.delivery_method_id},
				payment_method_id = ${orderData.payment_method_id},
				order_status_id = ${orderData.order_status_id},
				updated_at = NOW()
			WHERE id = ${orderId}
			RETURNING
				id,
				order_number,
				order_date,
				delivery_date,
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
				order_status_id,
				shipping_cost,
				subtotal_amount,
				total_amount,
				note,
				created_at,
				updated_at
		`;
		return order!;
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

	async getOrderNumber(
		sql: Sql,
		orderNumber: string,
	): Promise<{ id: number } | undefined> {
		const [order] = await sql<{ id: number }[]>`
			SELECT id FROM orders WHERE order_number = ${orderNumber}
		`;
		return order;
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
			LEFT JOIN order_statuses ON orders.order_status_id = order_statuses.id
		`;
	}
}
