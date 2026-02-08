import type { Sql } from "postgres";
import type {
	RecentOrderRow,
	RevenueTrendRow,
	StatusBreakdownRow,
	SummaryRow,
	TodaysDeliveryRow,
	TopItemRow,
	UpcomingDeliveryRow,
} from "./dashboard-schema.js";

export class DashboardRepository {
	async getSummary(sql: Sql): Promise<SummaryRow> {
		const [row] = await sql<SummaryRow[]>`
			SELECT
				COUNT(*) as total_orders,
				SUM(CASE WHEN os.name = 'lunas' THEN o.total_amount ELSE 0 END) as total_revenue,
				SUM(CASE WHEN os.name != 'lunas' THEN o.total_amount ELSE 0 END) as pending_revenue,
				CASE WHEN COUNT(*) > 0 THEN SUM(o.total_amount) / COUNT(*) ELSE 0 END as avg_order_value
			FROM orders o
			JOIN order_statuses os ON o.order_status_id = os.id
			WHERE o.order_date >= CURRENT_DATE - INTERVAL '30 days'
		`;
		return row!;
	}

	async getRecentOrders(sql: Sql): Promise<RecentOrderRow[]> {
		return await sql<RecentOrderRow[]>`
			SELECT
				o.id,
				o.order_number,
				o.order_date,
				o.recipient_name,
				o.total_amount,
				os.name as status
			FROM orders o
			JOIN order_statuses os ON o.order_status_id = os.id
			ORDER BY o.order_date DESC
			LIMIT 10
		`;
	}

	async getTodaysDeliveries(sql: Sql): Promise<TodaysDeliveryRow[]> {
		return await sql<TodaysDeliveryRow[]>`
			SELECT
				o.id,
				o.order_number,
				o.recipient_name,
				o.recipient_phone,
				o.recipient_address,
				os.name as status,
				dm.name as delivery_method
			FROM orders o
			JOIN order_statuses os ON o.order_status_id = os.id
			JOIN delivery_methods dm ON o.delivery_method_id = dm.id
			WHERE DATE(o.delivery_date) = CURRENT_DATE
			ORDER BY o.delivery_date ASC
		`;
	}

	async getRevenueTrend(sql: Sql): Promise<RevenueTrendRow[]> {
		return await sql<RevenueTrendRow[]>`
			SELECT
				DATE(o.order_date) as date,
				COUNT(*) as order_count,
				SUM(o.total_amount) as revenue
			FROM orders o
			JOIN order_statuses os ON o.order_status_id = os.id
			WHERE o.order_date >= CURRENT_DATE - INTERVAL '7 days'
				AND os.name = 'lunas'
			GROUP BY DATE(o.order_date)
			ORDER BY date ASC
		`;
	}

	async getTopItems(sql: Sql): Promise<TopItemRow[]> {
		return await sql<TopItemRow[]>`
			SELECT
				oi.item_name,
				SUM(oi.quantity) as total_quantity,
				SUM(oi.line_total) as total_sales
			FROM order_items oi
			JOIN orders o ON oi.order_id = o.id
			WHERE o.order_date >= CURRENT_DATE - INTERVAL '30 days'
			GROUP BY oi.item_name
			ORDER BY SUM(oi.quantity) DESC
			LIMIT 5
		`;
	}

	async getStatusBreakdown(sql: Sql): Promise<StatusBreakdownRow[]> {
		return await sql<StatusBreakdownRow[]>`
			WITH totals AS (
				SELECT COUNT(*) as total_orders
				FROM orders
				WHERE order_date >= CURRENT_DATE - INTERVAL '30 days'
			)
			SELECT
				os.name as status,
				COUNT(*) as count,
				SUM(o.total_amount) as total_amount,
				ROUND((COUNT(*) * 100.0 / NULLIF(totals.total_orders, 0)), 1) as percentage
			FROM orders o
			JOIN order_statuses os ON o.order_status_id = os.id
			CROSS JOIN totals
			WHERE o.order_date >= CURRENT_DATE - INTERVAL '30 days'
			GROUP BY os.name, os.id, totals.total_orders
			ORDER BY COUNT(*) DESC
		`;
	}

	async getUpcomingDeliveries(sql: Sql): Promise<UpcomingDeliveryRow[]> {
		return await sql<UpcomingDeliveryRow[]>`
			SELECT
				DATE(o.delivery_date) as delivery_day,
				COUNT(*) as order_count
			FROM orders o
			WHERE o.delivery_date BETWEEN CURRENT_DATE + INTERVAL '1 day'
				AND CURRENT_DATE + INTERVAL '3 days'
			GROUP BY DATE(o.delivery_date)
			ORDER BY delivery_day ASC
		`;
	}
}
