import {
	boolean,
	date,
	integer,
	pgEnum,
	pgTable,
	text,
	varchar,
} from "drizzle-orm/pg-core";

export const pickupDeliveryEnum = pgEnum("pickup_delivery_enum", [
	"pickup",
	"delivery",
	"gojek",
	"citytran",
	"paxel",
	"daytrans",
	"baraya",
	"lintas",
	"bineka",
	"jne",
]);

export const paymentEnum = pgEnum("payment_enum", [
	"tunai",
	"kartu_kredit",
	"transfer_bank",
	"qris",
]);

export const orderStatusEnum = pgEnum("order_status_enum", [
	"downpayment",
	"belum_bayar",
	"lunas",
]);

export const itemsTable = pgTable("items", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	itemName: varchar("item_name"),
	price: integer(),
});

export const personsTable = pgTable("persons", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	personName: varchar("person_name"),
});

export const personPhonesTable = pgTable("person_phones", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	personId: integer("person_id").references(() => personsTable.id),
	phoneNumber: varchar("phone_number"),
	isPreferred: boolean("is_preferred"),
});

export const personAddressesTable = pgTable("person_addresses", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	personId: integer("person_id").references(() => personsTable.id),
	address: varchar("address"),
	isPreferred: boolean("is_preferred"),
});

export const ordersTable = pgTable("orders", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	poNumber: varchar("po_number"),
	buyerId: integer("buyer_id").references(() => personsTable.id),
	recipientId: integer("recipient_id").references(() => personsTable.id),
	orderDate: date("order_date"),
	deliveryDate: date("delivery_date"),
	totalPurchase: integer("total_purchase"),
	pickupDelivery: pickupDeliveryEnum("pickup_delivery"),
	shippingCost: integer("shipping_cost"),
	grandTotal: integer("grand_total"),
	paymentMethod: paymentEnum("payment_method"),
	orderStatus: orderStatusEnum("order_status"),
	note: text("note"),
});

export const orderItemsTable = pgTable("order_items", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	orderId: integer("order_id").references(() => ordersTable.id),
	itemId: integer("item_id").references(() => itemsTable.id),
	quantity: integer("quantity"),
	itemName: varchar("item_name"),
	itemPrice: integer("item_price"),
});
