import { useEffect, useRef, useState } from "react";
import useTitleBar from "../hooks/useTitleBar.tsx";
import { toWorker } from "../util/index.ts";
import type { PodcastRecord } from "../../common/types.ts";

const PodcastCard = ({ podcast }: { podcast: PodcastRecord }) => {
	const audioUrlRef = useRef<string | null>(null);

	useEffect(() => {
		return () => {
			if (audioUrlRef.current) {
				URL.revokeObjectURL(audioUrlRef.current);
				audioUrlRef.current = null;
			}
		};
	}, []);

	if (!audioUrlRef.current) {
		const byteChars = atob(podcast.audioData);
		const byteNums = new Uint8Array(byteChars.length);
		for (let i = 0; i < byteChars.length; i++) {
			byteNums[i] = byteChars.charCodeAt(i);
		}
		const blob = new Blob([byteNums], { type: podcast.mimeType });
		audioUrlRef.current = URL.createObjectURL(blob);
	}

	const { homeTeam, awayTeam, homeScore, awayScore, season, playoffs } =
		podcast.gameInfo;
	const winner = homeScore > awayScore ? homeTeam : awayTeam;
	const winScore = Math.max(homeScore, awayScore);
	const loseScore = Math.min(homeScore, awayScore);
	const loser = homeScore > awayScore ? awayTeam : homeTeam;

	return (
		<div
			className="card mb-3"
			style={{ maxWidth: 560, background: "#1a1a1a", border: "1px solid #333" }}
		>
			<div className="card-body">
				<div className="d-flex align-items-center gap-2 mb-1">
					<span
						style={{
							fontSize: "0.7rem",
							textTransform: "uppercase",
							color: "#888",
							letterSpacing: "0.05em",
						}}
					>
						Season {season}
						{playoffs ? " · Playoffs" : ""}
					</span>
				</div>
				<div className="mb-2" style={{ fontSize: "1rem", fontWeight: 600 }}>
					<span style={{ color: "#fff" }}>
						{winner} {winScore}
					</span>
					<span style={{ color: "#666", margin: "0 6px" }}>–</span>
					<span style={{ color: "#888" }}>
						{loseScore} {loser}
					</span>
				</div>
				<div
					className="d-flex align-items-center gap-2 mb-2"
					style={{ fontSize: "0.8rem", color: "#aaa" }}
				>
					<strong style={{ color: "#e53935" }}>🎙 Inside the NBA</strong>
					<span className="text-muted">
						— {homeTeam} vs {awayTeam}
					</span>
				</div>
				<audio controls src={audioUrlRef.current} style={{ width: "100%" }} />
			</div>
		</div>
	);
};

const Shows = () => {
	useTitleBar({ title: "Shows" });

	const [podcasts, setPodcasts] = useState<PodcastRecord[] | null>(null);

	useEffect(() => {
		toWorker("main", "getAllPodcasts", undefined).then((all) => {
			// Sort newest first
			const sorted = [...all].sort((a, b) => b.createdAt - a.createdAt);
			setPodcasts(sorted);
		});
	}, []);

	if (podcasts === null) {
		return <div className="mt-3 text-muted">Loading...</div>;
	}

	if (podcasts.length === 0) {
		return (
			<div className="mt-3">
				<p className="text-muted">
					No podcasts yet. Simulate a basketball game and one will be generated
					automatically.
				</p>
			</div>
		);
	}

	return (
		<div className="mt-3">
			{podcasts.map((p) => (
				<PodcastCard key={p.gid} podcast={p} />
			))}
		</div>
	);
};

export default Shows;
