import type { Sql } from "postgres";
import { toDateOnlyStr, toDateStr, toInt, toNum } from "../../lib/coerce.js";
import { DashboardRepository } from "./dashboard-repository.js";
import type {
	DashboardResponse,
	RecentOrderRow,
	RevenueTrendRow,
	StatusBreakdownRow,
	SummaryRow,
	TodaysDeliveryRow,
	TopItemRow,
	UpcomingDeliveryRow,
} from "./dashboard-schema.js";

export class DashboardService {
	private repo = new DashboardRepository();

	constructor(private db: Sql) {}

	async getDashboard(): Promise<DashboardResponse> {
		const [
			summary,
			recentOrders,
			todaysDeliveries,
			revenueTrend,
			topItems,
			statusBreakdown,
			upcomingDeliveries,
		] = await Promise.all([
			this.repo.getSummary(this.db),
			this.repo.getRecentOrders(this.db),
			this.repo.getTodaysDeliveries(this.db),
			this.repo.getRevenueTrend(this.db),
			this.repo.getTopItems(this.db),
			this.repo.getStatusBreakdown(this.db),
			this.repo.getUpcomingDeliveries(this.db),
		]);

		return {
			summary: this._formatSummary(summary),
			recent_orders: recentOrders.map((r) => this._formatRecentOrder(r)),
			todays_deliveries: todaysDeliveries.map((r) =>
				this._formatTodaysDelivery(r),
			),
			revenue_trend: revenueTrend.map((r) => this._formatRevenueTrend(r)),
			top_items: topItems.map((r) => this._formatTopItem(r)),
			status_breakdown: statusBreakdown.map((r) =>
				this._formatStatusBreakdown(r),
			),
			upcoming_deliveries: upcomingDeliveries.map((r) =>
				this._formatUpcomingDelivery(r),
			),
		};
	}

	private _formatSummary(row: SummaryRow): DashboardResponse["summary"] {
		return {
			total_orders: toInt(row.total_orders),
			total_revenue: toInt(row.total_revenue),
			pending_revenue: toInt(row.pending_revenue),
			avg_order_value: toInt(row.avg_order_value),
		};
	}

	private _formatRecentOrder(
		row: RecentOrderRow,
	): DashboardResponse["recent_orders"][0] {
		return {
			id: row.id,
			order_number: row.order_number,
			order_date: toDateStr(row.order_date),
			recipient_name: row.recipient_name,
			total_amount: row.total_amount,
			status: row.status,
		};
	}

	private _formatTodaysDelivery(
		row: TodaysDeliveryRow,
	): DashboardResponse["todays_deliveries"][0] {
		return {
			id: row.id,
			order_number: row.order_number,
			recipient_name: row.recipient_name,
			recipient_phone: row.recipient_phone,
			recipient_address: row.recipient_address,
			status: row.status,
			delivery_method: row.delivery_method,
		};
	}

	private _formatRevenueTrend(
		row: RevenueTrendRow,
	): DashboardResponse["revenue_trend"][0] {
		return {
			date: toDateOnlyStr(row.date),
			order_count: toInt(row.order_count),
			revenue: toInt(row.revenue),
		};
	}

	private _formatTopItem(row: TopItemRow): DashboardResponse["top_items"][0] {
		return {
			item_name: row.item_name,
			total_quantity: toInt(row.total_quantity),
			total_sales: toInt(row.total_sales),
		};
	}

	private _formatStatusBreakdown(
		row: StatusBreakdownRow,
	): DashboardResponse["status_breakdown"][0] {
		return {
			status: row.status,
			count: toInt(row.count),
			total_amount: toInt(row.total_amount),
			percentage: toNum(row.percentage),
		};
	}

	private _formatUpcomingDelivery(
		row: UpcomingDeliveryRow,
	): DashboardResponse["upcoming_deliveries"][0] {
		return {
			delivery_day: toDateOnlyStr(row.delivery_day),
			order_count: toInt(row.order_count),
		};
	}
}
