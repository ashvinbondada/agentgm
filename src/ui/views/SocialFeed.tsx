import { useState, useEffect, useCallback } from "react";
import useTitleBar from "../hooks/useTitleBar.tsx";
import type { GeneratedPost } from "../../common/types.feedEvent.ts";
import { addFeedEventListener } from "../util/feedEventHandler.ts";
import { getPosts } from "../db/socialFeedDb.ts";

type FeedStatus = "loading" | "empty" | "ready";

const BADGE_CLASS: Record<GeneratedPost["eventType"], string> = {
	GAME_END: "bg-primary",
	HALFTIME: "bg-secondary",
	TRADE_ALERT: "bg-warning text-dark",
	DRAFT_PICK: "bg-info text-dark",
	INJURY: "bg-danger",
	PLAYER_SIGNING: "bg-success",
	SEASON_AWARD: "bg-warning text-dark",
	PLAYOFF_CLINCH: "bg-primary",
};

function relativeTime(ts: number): string {
	const diffMs = Date.now() - ts;
	const diffSec = Math.floor(diffMs / 1000);
	if (diffSec < 60) return `${diffSec}s ago`;
	const diffMin = Math.floor(diffSec / 60);
	if (diffMin < 60) return `${diffMin}m ago`;
	const diffHr = Math.floor(diffMin / 60);
	if (diffHr < 24) return `${diffHr}h ago`;
	const diffDay = Math.floor(diffHr / 24);
	return `${diffDay}d ago`;
}

const Post = ({ post }: { post: GeneratedPost }) => {
	const badgeClass = BADGE_CLASS[post.eventType] ?? "bg-secondary";
	return (
		<div className="card mb-2">
			<div className="card-body py-2 px-3">
				<div className="d-flex justify-content-between align-items-center mb-1">
					<strong className="me-2">@{post.handle}</strong>
					<span className={`badge ${badgeClass} me-auto`}>
						{post.eventType.replace(/_/g, " ")}
					</span>
					<small className="text-body-secondary ms-2">
						{relativeTime(post.createdAt)}
					</small>
				</div>
				<p className="mb-0">{post.body}</p>
			</div>
		</div>
	);
};

const SocialFeed = () => {
	useTitleBar({ title: "Social Feed" });

	const [status, setStatus] = useState<FeedStatus>("loading");
	const [posts, setPosts] = useState<GeneratedPost[]>([]);

	const loadPosts = useCallback(async () => {
		try {
			const fetched = await getPosts(50);
			setPosts(fetched);
			setStatus(fetched.length > 0 ? "ready" : "empty");
		} catch (err) {
			console.error("socialFeed: failed to read IDB", err);
			setStatus("empty");
		}
	}, []);

	// Initial load
	useEffect(() => {
		loadPosts();
	}, [loadPosts]);

	// Subscribe to feedEvent notifications from the game worker
	useEffect(() => {
		const unsub = addFeedEventListener(() => {
			loadPosts();
		});
		return unsub;
	}, [loadPosts]);

	if (status === "loading") {
		return <p className="text-body-secondary">Loading…</p>;
	}

	if (status === "empty") {
		return <p className="text-body-secondary">No posts yet.</p>;
	}

	return (
		<div>
			{posts.map((post) => (
				<Post key={post.postId} post={post} />
			))}
		</div>