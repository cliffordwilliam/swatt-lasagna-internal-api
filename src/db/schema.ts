import { integer, pgEnum, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const pickupDeliveryEnum = pgEnum("pickup_delivery_enum", [
	"Pickup",
	"Delivery",
	"Gojek",
	"Citytran",
	"Paxel",
	"Daytrans",
	"Baraya",
	"Lintas",
	"Bineka",
	"Jne",
]);

export const paymentEnum = pgEnum("payment_enum", [
	"Tunai",
	"Kartu Kredit",
	"Transfer Bank",
	"QRIS",
]);

export const orderStatusEnum = pgEnum("order_status_enum", [
	"Downpayment",
	"Belum bayar",
	"Lunas",
]);

export const itemsTable = pgTable("items", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	itemName: varchar("item_name"),
	price: integer(),
});

export const personTable = pgTable("person", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	personName: varchar("person_name"),
});

export const personPhoneTable = pgTable("person_phone", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	personId: integer("person_id"),
	phoneNumber: varchar("phone_number"),
	preferred: integer("preferred"),
});

export const personAddressTable = pgTable("person_address", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	personId: integer("person_id"),
	address: varchar("address"),
	preferred: integer("preferred"),
});

export const orderTable = pgTable("order", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	po: varchar("po"),
	buyerId: integer("buyer_id"),
	recipientId: integer("recipient_id"),
	orderDate: integer("order_date"),
	deliveryDate: integer("delivery_date"),
	totalPurchase: integer("total_purchase"),
	pickupDelivery: pickupDeliveryEnum("pickup_delivery"),
	shippingCost: integer("shipping_cost"),
	grandTotal: integer("grand_total"),
	payment: paymentEnum("payment"),
	orderStatus: orderStatusEnum("order_status"),
	note: text("note"),
});

export const orderItemTable = pgTable("order_item", {
	orderId: integer("order_id"),
	itemId: integer("item_id"),
	quantity: integer("quantity"),
	itemName: varchar("item_name"),
	itemPrice: integer("item_price"),
});
