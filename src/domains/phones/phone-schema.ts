import { type Static, Type } from "@sinclair/typebox";

export const CreatePhoneSchema = Type.Object({
	person_id: Type.Integer(),
	phone_number: Type.String({ minLength: 1, maxLength: 25 }),
});

export type CreatePhoneInput = Static<typeof CreatePhoneSchema>;

const PhoneSummarySchema = Type.Object({
	id: Type.Integer(),
	person_id: Type.Integer(),
	phone_number: Type.String({ minLength: 1, maxLength: 25 }),
});

export type PhoneSummaryRow = Static<typeof PhoneSummarySchema>;

export const SearchPhonesByNumberQuerySchema = Type.Object({
	person_id: Type.Integer(),
	phone_number: Type.String({ minLength: 1 }),
});

export const SearchPhoneResultSchema = Type.Object({
	id: Type.Integer(),
	phone_number: Type.String({ minLength: 1, maxLength: 25 }),
});

export type SearchPhoneResultRow = Static<typeof SearchPhoneResultSchema>;

export const SearchPhonesByNumberResponseSchema = Type.Array(
	SearchPhoneResultSchema,
	{
		maxItems: 50,
	},
);
