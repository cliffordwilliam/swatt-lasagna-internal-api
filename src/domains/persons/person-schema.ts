import { type Static, Type } from "@sinclair/typebox";

export const CreatePersonSchema = Type.Object({
	name: Type.String({ minLength: 1, maxLength: 255 }),
});

export type CreatePersonInput = Static<typeof CreatePersonSchema>;

export const PersonSchema = Type.Object({
	id: Type.Integer(),
	name: Type.String(),
});

export const GetPersonQuerySchema = Type.Object({
	name: Type.String({ minLength: 1 }),
});

export const SearchPersonsByNameResponseSchema = Type.Array(PersonSchema, {
	maxItems: 50,
});

export type PersonRow = Static<typeof PersonSchema>;
