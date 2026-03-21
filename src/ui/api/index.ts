import {
	ads,
	analyticsEvent,
	autoPlayDialog,
	confirm,
	confirmDeleteAllLeagues,
	local,
	localActions,
	realtimeUpdate,
	requestPersistentStorage,
	safeLocalStorage,
} from "../util/index.ts";
import { showEvent } from "../util/logEvent.ts";
import type {
	LocalStateUI,
	LogEventShowOptions,
	UpdateEvents,
	GameAttributesLeague,
} from "../../common/types.ts";
import { crossTabEmitter } from "../util/crossTabEmitter.ts";
import type {
	AgentConfig,
	FeedEvent,
	GeneratedPost,
	ResolvedAgent,
} from "../../common/types.feedEvent.ts";
import { getAllAccounts, addPost } from "../../worker/util/feedDb.ts";
import { feedEventHandler } from "../util/feedEventHandler.ts";

// Phase 2 agent config JSONs — one import per file, keyed by templateId.
import shamCharaniaJson from "../../data/socialAgents/journalists/sham_charania.json";
import fanHomerJson from "../../data/socialAgents/fans/homer.json";
import fanCasualJson from "../../data/socialAgents/fans/bandwagon.json";
import fanHaterJson from "../../data/socialAgents/fans/hater.json";
import fanStatNerdJson from "../../data/socialAgents/fans/stat_nerd.json";
import orgTemplateJson from "../../data/socialAgents/orgs/template.json";
import playerTemplateJson from "../../data/socialAgents/players/template.json";

const agentConfigMap: Record<string, AgentConfig> = {
	sham_charania: shamCharaniaJson as AgentConfig,
	fan_homer: fanHomerJson as AgentConfig,
	fan_casual: fanCasualJson as AgentConfig,
	fan_hater: fanHaterJson as AgentConfig,
	fan_stat_nerd: fanStatNerdJson as AgentConfig,
	org_template: orgTemplateJson as AgentConfig,
	player_template: playerTemplateJson as AgentConfig,
};

const initAds = (type: "accountChecked" | "uiRendered") => {
	ads.setLoadingDone(type);
};

const initGold = () => {
	ads.stop();
};

const deleteGames = (gids: number[]) => {
	localActions.deleteGames(gids);
};

const mergeGames = (games: LocalStateUI["games"]) => {
	localActions.mergeGames(games);
};

// Should only be called from Shared Worker, to move other tabs to new league because only one can be open at a time
const newLid = async (lid: number) => {
	const parts = window.location.pathname.split("/");

	if (parts[1] === "l" && Number.parseInt(parts[2]!) !== lid) {
		parts[2] = String(lid);
		const newPathname = parts.join("/");
		await realtimeUpdate(["firstRun"], newPathname);
		localActions.update({
			lid,
		});
	}
};

async function realtimeUpdate2(
	updateEvents: UpdateEvents = [],
	url?: string,
	raw?: Record<string, unknown>,
) {
	await realtimeUpdate(updateEvents, url, raw);
}

const resetLeague = () => {
	localActions.resetLeague();
};

const setGameAttributes = (
	gameAttributes: Partial<GameAttributesLeague>,
	flagOverrides: LocalStateUI["flagOverrides"] | undefined,
) => {
	localActions.updateGameAttributes(gameAttributes, flagOverrides);
};

const showEvent2 = (options: LogEventShowOptions) => {
	showEvent(options);
};

const showModal = () => {
	if (!window.enableLogging) {
		return;
	}

	// No ads for Gold members
	if (local.getState().gold !== false) {
		return;
	}

	// Max once/hour
	const date = new Date().toISOString().slice(0, 13);
	const lastDate = safeLocalStorage.getItem("lastDateShowModal");
	if (date === lastDate) {
		return;
	}
	safeLocalStorage.setItem("lastDateShowModal", date);

	const r = Math.random();

	if ((ads.adBlock() && r < 0.1) || r < 0.01) {
		localActions.update({
			showNagModal: true,
		});
	}
};

const updateLocal = (obj: Partial<LocalStateUI>) => {
	localActions.update(obj);
};

const updateTeamOvrs = (ovrs: number[]) => {
	const games = local.getState().games;

	// Find upcoming game, it's the only one that needs updating because it's the only one displayed in a ScoreBox in LeagueTopBar
	const gameIndex = games.findIndex((game) => game.teams[0].pts === undefined);
	if (gameIndex >= 0) {
		const { teams } = games[gameIndex]!;
		if (
			teams[0].ovr !== ovrs[teams[0].tid] ||
			teams[1].ovr !== ovrs[teams[1].tid]
		) {
			games[gameIndex] = {
				...games[gameIndex]!,
			};
			teams[0].ovr = ovrs[teams[0].tid];
			teams[1].ovr = ovrs[teams[1].tid];

			localActions.update({
				games: games.slice(),
			});
		}
	}
};

const crossTabEmit = (
	parameters: Parameters<(typeof crossTabEmitter)["emit"]>,
) => {
	crossTabEmitter.emit(...parameters);
};

const feedEvent = async (event: FeedEvent): Promise<void> => {
	// Phase 18-lite shim: temporary E2E path before the Feed Worker is built.
	// Receives a FeedEvent from the game worker, resolves matching agents, calls
	// the feed API, and persists the returned posts to socialFeedDb.

	const accounts = await getAllAccounts();

	const resolvedAgents: ResolvedAgent[] = [];
	for (const account of accounts) {
		if (account.status !== "active") continue;
		const config = agentConfigMap[account.templateId];
		if (!config) continue;
		if (!config.triggers.includes(event.type)) continue;
		const resolved: ResolvedAgent = {
			...config,
			agentId: account.agentId,
			displayName: account.displayName,
		};
		resolvedAgents.push(resolved);
	}

	if (resolvedAgents.length === 0) {
		console.log(`[feedEvent] no active agents matched ${event.type}`);
		return;
	}

	const feedApiUrl =
		(process.env as Record<string, string | undefined>).FEED_API_URL ??
		"/api/feed";

	const response = await fetch(feedApiUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ event, agents: resolvedAgents }),
	});

	if (!response.ok) {
		console.error(
			`[feedEvent] feed API returned ${response.status} for ${event.type}`,
		);
		return;
	}

	const { posts } = (await response.json()) as { posts: GeneratedPost[] };

	await Promise.all(posts.map((post) => addPost(post)));

	console.log(`[feedEvent] generated ${posts.length} posts for ${event.type}`);

	// Phase 17: notify UI listeners so the feed panel re-reads IDB.
	feedEventHandler(event);
};

export default {
	analyticsEvent,
	autoPlayDialog,
	confirm,
	confirmDeleteAllLeagues,
	crossTabEmit,
	deleteGames,
	feedEvent,
	initAds,
	initGold,
	mergeGames,
	newLid,
	realtimeUpdate: realtimeUpdate2,
	requestPersistentStorage,
	resetLeague,
	setGameAttributes,
	showEvent: showEvent2,
	showModal,
	updateLocal,
	updateTeamOvrs,
};
