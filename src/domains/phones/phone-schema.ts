import { type Static, Type } from "@sinclair/typebox";

export const CreatePhoneSchema = Type.Object({
	person_id: Type.Integer(),
	phone_number: Type.String({ minLength: 1, maxLength: 25 }),
});

export type CreatePhoneInput = Static<typeof CreatePhoneSchema>;

export const PhoneSchema = Type.Object({
	id: Type.Integer(),
	person_id: Type.Integer(),
	phone_number: Type.String({ minLength: 1, maxLength: 25 }),
	created_at: Type.String({ format: "date-time" }),
	updated_at: Type.String({ format: "date-time" }),
});

export type PhoneRow = Static<typeof PhoneSchema>;

export const PhoneSummarySchema = Type.Object({
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
