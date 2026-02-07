import type { FastifyPluginAsync } from "fastify";
import { DashboardResponseSchema } from "./dashboard-schema.js";
import { DashboardService } from "./dashboard-service.js";

const dashboardRoutes: FastifyPluginAsync = async (fastify) => {
	const dashboardService = new DashboardService(fastify.db);

	fastify.get(
		"/",
		{
			schema: {
				response: { 200: DashboardResponseSchema },
			},
		},
		async (_request, reply) => {
			const dashboard = await dashboardService.getDashboard();
			return reply.status(200).send(dashboard);
		},
	);
};

export default dashboardRoutes;
