import type { VercelRequest, VercelResponse } from "@vercel/node";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { buildSystemPrompt, buildEventPrompt } from "./buildPrompt.ts";
import type {
	FeedEvent,
	GeneratedPost,
	ResolvedAgent,
} from "../src/common/types.feedEvent.ts";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method !== "POST") {
		res.status(405).end("Method Not Allowed");
		return;
	}

	if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
		res.status(500).json({
			error:
				"Server misconfiguration: GOOGLE_GENERATIVE_AI_API_KEY is not set.",
		});
		return;
	}

	const rawBody = req.body;
	const body =
		typeof rawBody === "string"
			? (JSON.parse(rawBody) as { event: FeedEvent; agents: ResolvedAgent[] })
			: (rawBody as { event: FeedEvent; agents: ResolvedAgent[] });

	const { event, agents } = body;
	const posts: GeneratedPost[] = [];

	for (const agent of agents) {
		if (Math.random() >= agent.postProbability) {
			continue;
		}

		try {
			const result = await generateText({
				model: google("gemini-2.5-flash"),
				system: buildSystemPrompt(agent),
				prompt: buildEventPrompt(agent, event),
				maxTokens: 300,
			});

			const postBody = result.text.trim();
			if (!postBody) {
				console.log(
					`[api/feed] Agent ${agent.agentId} returned empty text — skipping`,
				);
				continue;
			}

			// Truncate to 280 chars if model overruns
			const truncated =
				postBody.length > 280 ? postBody.slice(0, 280) : postBody;

			const generatedPost: GeneratedPost = {
				postId: `${agent.agentId}-${event.timestamp}-${event.type}`,
				agentId: agent.agentId,
				handle: agent.handle,
				body: truncated,
				eventType: event.type,
				threadId: null,
				parentId: null,
				imageUrl: null,
				createdAt: Date.now(),
				likes: 0,
				reposts: 0,
			};

			posts.push(generatedPost);
		} catch (err) {
			console.error(
				`[api/feed] Error generating post for agent ${agent.agentId}:`,
				err,
			);
		}
	}

	res.status(200).json({ posts });
}
