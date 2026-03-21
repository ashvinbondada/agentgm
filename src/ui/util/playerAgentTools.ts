import { bySport } from "../../common/index.ts";
import type { PlayerEntityContext } from "./agentChatUi.ts";
import type { AgentGameContext } from "./agentGameState.ts";
import toWorker from "./toWorker.ts";

export const runPlayerGetMyStats = async (
	player: PlayerEntityContext,
	ctx: AgentGameContext,
) => {
	const result = await toWorker("main", "runBefore", {
		viewId: "player",
		params: {
			pid: String(player.pid),
		},
		ctxBBGM: {},
		updateEvents: [],
		prevData: {},
	});

	if (result === undefined) {
		return { error: "League not ready. Open a league and try again." };
	}

	const view = result as {
		errorMessage?: string;
		player?: unknown;
		[key: string]: unknown;
	};

	if (view.errorMessage) {
		return { error: view.errorMessage };
	}

	if (view.player === undefined) {
		return { error: "No player data returned." };
	}

	return view;
};

export const runPlayerGetMyContract = async (
	player: PlayerEntityContext,
) => {
	return {
		pid: player.pid,
		name: `${player.firstName} ${player.lastName}`,
		contractAmount: player.contractAmount,
		contractExp: player.contractExp,
	};
};

export const runPlayerGetTeamStandings = async (
	ctx: AgentGameContext,
) => {
	const standingsType = bySport({
		baseball: "div" as const,
		basketball: "conf" as const,
		football: "div" as const,
		hockey: "div" as const,
	});

	const result = await toWorker("main", "runBefore", {
		viewId: "standings",
		params: {
			season: String(ctx.season),
			type: standingsType,
		},
		ctxBBGM: {},
		updateEvents: [],
		prevData: {},
	});

	if (result === undefined) {
		return { error: "League not ready. Open a league and try again." };
	}

	if (
		!(result as Record<string, unknown>)?.rankingGroups ||
		!(result as any).rankingGroups?.league?.[0]
	) {
		return { error: "No standings data returned." };
	}

	const data = result as any;
	const teams = data.rankingGroups.league[0].map((t: any) => ({
		abbrev: t.abbrev,
		name: `${t.region} ${t.name}`,
		won: t.seasonAttrs.won,
		lost: t.seasonAttrs.lost,
		tied: t.seasonAttrs.tied,
		otl: t.seasonAttrs.otl,
		winp: t.seasonAttrs.winp,
		rank: t.rank?.league,
	}));

	return {
		season: data.season,
		standingsType: data.type,
		teams,
	};
};
