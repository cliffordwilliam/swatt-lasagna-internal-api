import { type Static, Type } from "@sinclair/typebox";

export interface SummaryRow {
	total_orders: number | string;
	total_revenue: number | string | null;
	pending_revenue: number | string | null;
	avg_order_value: number | string | null;
}

export interface RecentOrderRow {
	id: number;
	order_number: string;
	order_date: Date;
	recipient_name: string;
	total_amount: number;
	status: string;
}

export interface TodaysDeliveryRow {
	id: number;
	order_number: string;
	recipient_name: string;
	recipient_phone: string;
	recipient_address: string;
	status: string;
	delivery_method: string;
}

export interface RevenueTrendRow {
	date: Date;
	order_count: number | string;
	revenue: number | string | null;
}

export interface TopItemRow {
	item_name: string;
	total_quantity: number | string;
	total_sales: number | string | null;
}

export interface StatusBreakdownRow {
	status: string;
	count: number | string;
	total_amount: number | string | null;
	percentage: number | string;
}

export interface UpcomingDeliveryRow {
	delivery_day: Date;
	order_count: number | string;
}

const DashboardSummarySchema = Type.Object({
	total_orders: Type.Integer(),
	total_revenue: Type.Integer(),
	pending_revenue: Type.Integer(),
	avg_order_value: Type.Integer(),
});

const DashboardTodaysDeliverySchema = Type.Object({
	id: Type.Integer(),
	order_number: Type.String(),
	recipient_name: Type.String(),
	recipient_phone: Type.String(),
	recipient_address: Type.String(),
	status: Type.String(),
	delivery_method: Type.String(),
});

const DashboardRecentOrderSchema = Type.Object({
	id: Type.Integer(),
	order_number: Type.String(),
	order_date: Type.String({ format: "date-time" }),
	recipient_name: Type.String(),
	total_amount: Type.Integer(),
	status: Type.String(),
});

const DashboardRevenueTrendItemSchema = Type.Object({
	date: Type.String({ format: "date" }),
	order_count: Type.Integer(),
	revenue: Type.Integer(),
});

const DashboardTopItemSchema = Type.Object({
	item_name: Type.String(),
	total_quantity: Type.Integer(),
	total_sales: Type.Integer(),
});

const DashboardStatusBreakdownItemSchema = Type.Object({
	status: Type.String(),
	count: Type.Integer(),
	total_amount: Type.Integer(),
	percentage: Type.Number(),
});

const DashboardUpcomingDeliverySchema = Type.Object({
	delivery_day: Type.String(),
	order_count: Type.Integer(),
});

export const DashboardResponseSchema = Type.Object({
	summary: DashboardSummarySchema,
	recent_orders: Type.Array(DashboardRecentOrderSchema),
	todays_deliveries: Type.Array(DashboardTodaysDeliverySchema),
	revenue_trend: Type.Array(DashboardRevenueTrendItemSchema),
	top_items: Type.Array(DashboardTopItemSchema),
	status_breakdown: Type.Array(DashboardStatusBreakdownItemSchema),
	upcoming_deliveries: Type.Array(DashboardUpcomingDeliverySchema),
});

export type DashboardResponse = Static<typeof DashboardResponseSchema>;
