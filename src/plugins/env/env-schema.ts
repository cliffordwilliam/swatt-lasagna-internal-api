import { type Static, Type } from "@sinclair/typebox";

export const envSchema = Type.Object({
	DATABASE_URL: Type.String(),
});

export type envType = Static<typeof envSchema>;
