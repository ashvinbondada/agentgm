import { z } from "zod";

export const playerChatTools = {
	getMyStats: {
		description:
			"Look up your own stats for the current season including points, rebounds, assists, and advanced metrics. Use this when the user asks about your performance or when you want to discuss your play.",
		inputSchema: z.object({}),
	},
	getMyContract: {
		description:
			"Look up your current contract details including salary and expiration year. Use this when discussing contract situations or your future with the team.",
		inputSchema: z.object({}),
	},
	getTeamStandings: {
		description:
			"Check your team's current record and standing in the league. Use this when discussing team performance, playoff chances, or the season so far.",
		inputSchema: z.object({}),
	},
} as const;

export type PlayerChatToolName = keyof typeof playerChatTools;
