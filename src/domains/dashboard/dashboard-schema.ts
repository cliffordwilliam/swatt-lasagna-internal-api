import { type Static, Type } from "@sinclair/typebox";

export interface SummaryRow {
	total_orders: number | string;
	paid_orders: number | string;
	unpaid_orders: number | string;
	downpayment_orders: number | string;
	total_revenue: number | string | null;
	pending_revenue: number | string | null;
	avg_order_value: number | string | null;
}

export interface RecentOrderRow {
	id: number;
	order_number: string;
	order_date: Date;
	delivery_date: Date;
	recipient_name: string;
	total_amount: number;
	status: string;
	payment_method: string;
	delivery_method: string;
}

export interface TodaysDeliveryRow {
	id: number;
	order_number: string;
	delivery_date: Date;
	recipient_name: string;
	recipient_phone: string;
	recipient_address: string;
	total_amount: number;
	status: string;
	delivery_method: string;
}

export interface RevenueTrendRow {
	date: Date;
	order_count: number | string;
	revenue: number | string | null;
	paid_revenue: number | string | null;
}

export interface TopItemRow {
	item_name: string;
	total_quantity: number | string;
	total_sales: number | string | null;
	order_count: number | string;
	avg_price: number | string | null;
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
	total_value: number | string | null;
}

const DashboardSummarySchema = Type.Object({
	total_orders: Type.Integer(),
	paid_orders: Type.Integer(),
	unpaid_orders: Type.Integer(),
	downpayment_orders: Type.Integer(),
	total_revenue: Type.Integer(),
	pending_revenue: Type.Integer(),
	avg_order_value: Type.Integer(),
});

const DashboardRecentOrderSchema = Type.Object({
	id: Type.Integer(),
	order_number: Type.String(),
	order_date: Type.String({ format: "date-time" }),
	delivery_date: Type.String({ format: "date-time" }),
	recipient_name: Type.String(),
	total_amount: Type.Integer(),
	status: Type.String(),
	payment_method: Type.String(),
	delivery_method: Type.String(),
});

const DashboardTodaysDeliverySchema = Type.Object({
	id: Type.Integer(),
	order_number: Type.String(),
	delivery_date: Type.String({ format: "date-time" }),
	recipient_name: Type.String(),
	recipient_phone: Type.String(),
	recipient_address: Type.String(),
	total_amount: Type.Integer(),
	status: Type.String(),
	delivery_method: Type.String(),
});

const DashboardRevenueTrendItemSchema = Type.Object({
	date: Type.String({ format: "date" }),
	order_count: Type.Integer(),
	revenue: Type.Integer(),
	paid_revenue: Type.Integer(),
});

const DashboardTopItemSchema = Type.Object({
	item_name: Type.String(),
	total_quantity: Type.Integer(),
	total_sales: Type.Integer(),
	order_count: Type.Integer(),
	avg_price: Type.Integer(),
});

const DashboardStatusBreakdownItemSchema = Type.Object({
	status: Type.String(),
	count: Type.Integer(),
	total_amount: Type.Integer(),
	percentage: Type.Number(),
});

const DashboardUpcomingDeliverySchema = Type.Object({
	delivery_day: Type.String({ format: "date" }),
	order_count: Type.Integer(),
	total_value: Type.Integer(),
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
