import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const itemsTable = pgTable("items", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: varchar(),
});
