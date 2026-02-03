import { type Static, Type } from "@sinclair/typebox";

export const PersonSchema = Type.Object({
	id: Type.Integer(),
	name: Type.String(),
});

export const PhoneSchema = Type.Object({
	id: Type.Integer(),
	person_id: Type.Integer(),
	phone_number: Type.String(),
});

export const AddressSchema = Type.Object({
	id: Type.Integer(),
	person_id: Type.Integer(),
	address: Type.String(),
});

export const GetPersonByNameQuerySchema = Type.Object({
	name: Type.String({ minLength: 1 }),
});

export const SearchPersonsByNameQuerySchema = Type.Object({
	name: Type.String({ minLength: 1 }),
});

export const SearchPersonsByNameResponseSchema = Type.Array(PersonSchema, {
	maxItems: 50,
});

export type PersonRow = Static<typeof PersonSchema>;
export type PhoneRow = Static<typeof PhoneSchema>;
export type AddressRow = Static<typeof AddressSchema>;
export type GetPersonByNameQuery = Static<typeof GetPersonByNameQuerySchema>;
export type SearchPersonsByNameQuery = Static<
	typeof SearchPersonsByNameQuerySchema
>;
export type SearchPersonsByNameResponse = Static<
	typeof SearchPersonsByNameResponseSchema
>;
