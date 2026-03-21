// processFeedEvent.ts — processes a FeedEvent inline in the game worker.
//
// This is the same logic as feedWorker.ts but runs as a regular async module
// (no separate Web Worker spawn needed). Called fire-and-forget from emitFeedEvent.

import type {
	AgentConfig,
	FeedEvent,
	GeneratedPost,
	ResolvedAgent,
} from "../../common/types.feedEvent.ts";
import { getAllAccounts, addPost } from "./feedDb.ts";

import shamCharania from "../../data/socialAgents/journalists/sham_charania.json";
import fanBandwagon from "../../data/socialAgents/fans/bandwagon.json";
import fanHater from "../../data/socialAgents/fans/hater.json";
import fanHomer from "../../data/socialAgents/fans/homer.json";
import fanStatNerd from "../../data/socialAgents/fans/stat_nerd.json";
import orgTemplate from "../../data/socialAgents/orgs/template.json";
import playerTemplate from "../../data/socialAgents/players/template.json";

const configMap: Record<string, AgentConfig> = {
	sham_charania: shamCharania as AgentConfig,
	fan_casual: fanBandwagon as AgentConfig,
	fan_hater: fanHater as AgentConfig,
	fan_homer: fanHomer as AgentConfig,
	fan_stat_nerd: fanStatNerd as AgentConfig,
	org_template: orgTemplate as AgentConfig,
	player_template: playerTemplate as AgentConfig,
};

const FEED_API_URL: string =
	(typeof process !== "undefined" && process.env?.FEED_API_URL) || "/api/feed";

// Serial queue — one event processed at a time, no backpressure buildup.
const queue: FeedEvent[] = [];
let processing = false;

async function handleEvent(event: FeedEvent): Promise<void> {
	const allAccounts = await getAllAccounts();

	const triggeredAccounts = allAccounts.filter((account) => {
		if (account.status !== "active") return false;
		const config = configMap[account.templateId];
		return config !== undefined && config.triggers.includes(event.type);
	});

	if (triggeredAccounts.length === 0) return;

	const agents: ResolvedAgent[] = triggeredAccounts.map((account) => {
		const config = configMap[account.templateId]!;
		return {
			...config,
			agentId: account.agentId,
			displayName: account.displayName,
			handle: account.handle,
		};
	});

	const response = await fetch(FEED_API_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ event, agents }),
	});

	if (!response.ok) {
		throw new Error(
			`[feed] POST ${FEED_API_URL} returned ${response.status} ${response.statusText}`,
		);
	}

	const data = (await response.json()) as { posts: GeneratedPost[] };
	const posts = data.posts ?? [];
	await Promise.all(posts.map((post) => addPost(post)));
	console.log(`[feed] ${event.type}: saved ${posts.length} post(s)`);
}

async function processNext(): Promise<void> {
	if (queue.length === 0) {
		processing = false;
		return;
	}
	processing = true;
	const event = queue.shift()!;
	await handleEvent(event).catch((err) =>
		console.error("[feed] error processing event:", err),
	);
	void processNext();
}

export function processFeedEvent(event: FeedEvent): void {
	queue.push(event);
	if (!processing) void processNext();
}
