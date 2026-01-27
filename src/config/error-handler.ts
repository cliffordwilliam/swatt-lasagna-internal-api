import type { FastifyError, FastifyInstance } from "fastify";
import { AppError } from "../lib/errors.js";

interface PostgresError extends Error {
	code: string;
	constraint_name?: string;
	constraint?: string;
	detail?: string;
}

export default function errorHandler(fastify: FastifyInstance) {
	fastify.setErrorHandler(
		async (error: FastifyError | PostgresError | AppError, request, reply) => {
			request.log.error({
				err: error,
				method: request.method,
				url: request.url,
			});

			if (error instanceof AppError) {
				return reply.status(error.statusCode).send({
					message: error.message,
				});
			}

			if ((error as FastifyError).validation) {
				return reply.status(400).send({
					message: error.message,
					details: (error as FastifyError).validation,
				});
			}

			const pgError = error as PostgresError;
			if (pgError.code?.startsWith("23")) {
				return reply.status(400).send({
					message: pgError.detail || error.message,
				});
			}

			const statusCode = (error as FastifyError).statusCode || 500;

			return reply.status(statusCode).send({
				message: "Something went wrong",
			});
		},
	);
}
