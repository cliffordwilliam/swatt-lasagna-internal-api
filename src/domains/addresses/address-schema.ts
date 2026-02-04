import { type Static, Type } from "@sinclair/typebox";

export const CreateAddressSchema = Type.Object({
	person_id: Type.Integer(),
	address: Type.String({ minLength: 1, maxLength: 500 }),
});

export type CreateAddressInput = Static<typeof CreateAddressSchema>;

export const AddressSchema = Type.Object({
	id: Type.Integer(),
	person_id: Type.Integer(),
	address: Type.String({ minLength: 1, maxLength: 500 }),
	created_at: Type.String({ format: "date-time" }),
	updated_at: Type.String({ format: "date-time" }),
});

export type AddressRow = Static<typeof AddressSchema>;

export const AddressSummarySchema = Type.Object({
	id: Type.Integer(),
	person_id: Type.Integer(),
	address: Type.String({ minLength: 1, maxLength: 500 }),
});

export type AddressSummaryRow = Static<typeof AddressSummarySchema>;

export const SearchAddressesByValueQuerySchema = Type.Object({
	person_id: Type.Integer(),
	address: Type.String({ minLength: 1 }),
});

export const SearchAddressResultSchema = Type.Object({
	id: Type.Integer(),
	address: Type.String({ minLength: 1, maxLength: 500 }),
});

export type SearchAddressResultRow = Static<typeof SearchAddressResultSchema>;

export const SearchAddressesByValueResponseSchema = Type.Array(
	SearchAddressResultSchema,
	{
		maxItems: 50,
	},
);
