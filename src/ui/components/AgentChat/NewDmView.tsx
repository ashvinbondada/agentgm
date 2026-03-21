import { useEffect, useMemo, useState } from "react";
import { orderBy } from "../../../common/utils.ts";
import {
	useAgentChatUi,
	type Conversation,
	type EntityContext,
	type PlayerEntityContext,
} from "../../util/agentChatUi.ts";
import { useLocalPartial } from "../../util/index.ts";
import toWorker from "../../util/toWorker.ts";

type RosterRunBeforeTeam = {
	strategy?: string;
	region?: string;
	name?: string;
	seasonAttrs?: { won?: number; lost?: number };
};

type RosterPlayer = {
	pid: number;
	firstName: string;
	lastName: string;
	age: number;
	injury: { type: string; gamesRemaining: number };
	contract: { amount: number; exp: number };
	mood?: { trait?: string };
	ratings: { pos: string; ovr: number };
};

type Tab = "teams" | "players";

export default function NewDmView() {
	const openInbox = useAgentChatUi((s) => s.openInbox);
	const upsertConversation = useAgentChatUi((s) => s.upsertConversation);
	const openConversation = useAgentChatUi((s) => s.openConversation);

	const { teamInfoCache, userTid, season } = useLocalPartial([
		"teamInfoCache",
		"userTid",
		"season",
	]);

	const [tab, setTab] = useState<Tab>("teams");
	const [query, setQuery] = useState("");
	const [loadingTid, setLoadingTid] = useState<number | null>(null);
	const [loadingPid, setLoadingPid] = useState<number | null>(null);
	const [rosterPlayers, setRosterPlayers] = useState<RosterPlayer[]>([]);
	const [rosterLoaded, setRosterLoaded] = useState(false);

	useEffect(() => {
		if (tab !== "players" || rosterLoaded) {
			return;
		}

		let cancelled = false;

		const load = async () => {
			const userTeam = teamInfoCache[userTid];
			if (!userTeam) {
				return;
			}

			const result = await toWorker("main", "runBefore", {
				viewId: "roster",
				params: {
					abbrev: `${userTeam.abbrev}_${userTid}`,
					season: String(season),
					playoffs: "regularSeason",
				},
				ctxBBGM: {},
				updateEvents: [],
				prevData: {},
			});

			if (cancelled || result === undefined) {
				return;
			}

			const rd = result as {
				errorMessage?: string;
				players?: RosterPlayer[];
			};

			if (!rd.errorMessage && Array.isArray(rd.players)) {
				setRosterPlayers(rd.players);
			}
			setRosterLoaded(true);
		};

		void load();
		return () => {
			cancelled = true;
		};
	}, [tab, rosterLoaded, teamInfoCache, userTid, season]);

	const teams = useMemo(() => {
		const rows: {
			tid: number;
			abbrev: string;
			region: string;
			name: string;
		}[] = [];
		for (const [tid, t] of teamInfoCache.entries()) {
			if (!t || tid === userTid || t.disabled) {
				continue;
			}
			rows.push({
				tid,
				abbrev: t.abbrev,
				region: t.region,
				name: t.name,
			});
		}
		const sorted = orderBy(rows, ["region", "name"]);
		const q = query.trim().toLowerCase();
		if (!q) {
			return sorted;
		}
		return sorted.filter(
			(row) =>
				row.abbrev.toLowerCase().includes(q) ||
				row.name.toLowerCase().includes(q),
		);
	}, [teamInfoCache, userTid, query]);

	const filteredPlayers = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) {
			return rosterPlayers;
		}
		return rosterPlayers.filter(
			(p) =>
				p.firstName.toLowerCase().includes(q) ||
				p.lastName.toLowerCase().includes(q) ||
				`${p.firstName} ${p.lastName}`.toLowerCase().includes(q),
		);
	}, [rosterPlayers, query]);

	const handleSelectTeam = async (row: (typeof teams)[number]) => {
		setLoadingTid(row.tid);
		try {
			const rosterData = await toWorker("main", "runBefore", {
				viewId: "roster",
				params: {
					abbrev: `${row.abbrev}_${row.tid}`,
					season: String(season),
					playoffs: "regularSeason",
				},
				ctxBBGM: {},
				updateEvents: [],
				prevData: {},
			});

			if (rosterData === undefined) {
				return;
			}

			const rd = rosterData as {
				errorMessage?: string;
				t?: RosterRunBeforeTeam;
			};

			if (rd.errorMessage || !rd.t) {
				return;
			}

			const t = rd.t;
			const strategyRaw = t.strategy;
			const strategy: EntityContext["strategy"] =
				strategyRaw === "contending" || strategyRaw === "rebuilding"
					? strategyRaw
					: "rebuilding";

			const entityContext: EntityContext = {
				tid: row.tid,
				abbrev: row.abbrev,
				region: t.region ?? row.region,
				name: t.name ?? row.name,
				strategy,
				won: t.seasonAttrs?.won ?? 0,
				lost: t.seasonAttrs?.lost ?? 0,
			};

			const conv: Conversation = {
				id: `gm-${row.tid}`,
				type: "gm",
				name: `${entityContext.region} ${entityContext.name} GM`,
				lastMessage: "",
				updatedAt: Date.now(),
				entityContext,
			};

			upsertConversation(conv);
			openConversation(conv.id);
		} finally {
			setLoadingTid(null);
		}
	};

	const handleSelectPlayer = (p: RosterPlayer) => {
		setLoadingPid(p.pid);

		const userTeam = teamInfoCache[userTid];
		const abbrev = userTeam?.abbrev ?? "???";

		let mood: PlayerEntityContext["mood"] = "neutral";
		const moodTrait = (p as any).mood?.trait;
		if (moodTrait === "happy" || moodTrait === "unhappy") {
			mood = moodTrait;
		}

		const playerEntityContext: PlayerEntityContext = {
			pid: p.pid,
			firstName: p.firstName,
			lastName: p.lastName,
			tid: userTid,
			abbrev,
			pos: p.ratings.pos,
			ovr: p.ratings.ovr,
			age: p.age,
			injury:
				p.injury && p.injury.gamesRemaining > 0
					? {
							type: p.injury.type,
							gamesRemaining: p.injury.gamesRemaining,
						}
					: null,
			contractAmount: p.contract.amount,
			contractExp: p.contract.exp,
			mood,
		};

		const conv: Conversation = {
			id: `player-${p.pid}`,
			type: "player",
			name: `${p.firstName} ${p.lastName}`,
			lastMessage: "",
			updatedAt: Date.now(),
			playerEntityContext,
		};

		upsertConversation(conv);
		openConversation(conv.id);
		setLoadingPid(null);
	};

	const searchPlaceholder =
		tab === "teams" ? "Search teams..." : "Search players...";

	return (
		<div className="d-flex flex-column h-100">
			<div className="d-flex align-items-center gap-2 border-bottom px-2 py-2">
				<button
					type="button"
					className="btn btn-sm btn-outline-secondary"
					onClick={() => openInbox()}
				>
					← Back
				</button>
				<span className="fw-semibold">New Message</span>
			</div>
			<div className="d-flex border-bottom">
				<button
					type="button"
					className={`btn btn-sm flex-grow-1 rounded-0 border-0${tab === "teams" ? " fw-bold border-bottom border-primary border-2" : ""}`}
					onClick={() => {
						setTab("teams");
						setQuery("");
					}}
				>
					Teams
				</button>
				<button
					type="button"
					className={`btn btn-sm flex-grow-1 rounded-0 border-0${tab === "players" ? " fw-bold border-bottom border-primary border-2" : ""}`}
					onClick={() => {
						setTab("players");
						setQuery("");
					}}
				>
					My Players
				</button>
			</div>
			<div className="px-2 pt-2">
				<input
					type="search"
					className="form-control form-control-sm"
					placeholder={searchPlaceholder}
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					autoComplete="off"
				/>
			</div>
			<div className="list-group list-group-flush flex-grow-1 overflow-auto mt-2">
				{tab === "teams" &&
					teams.map((row) => (
						<button
							key={row.tid}
							type="button"
							className="list-group-item list-group-item-action text-start border-0 border-bottom rounded-0"
							disabled={loadingTid !== null}
							onClick={() => void handleSelectTeam(row)}
						>
							{row.region} {row.name}
						</button>
					))}
				{tab === "players" &&
					(!rosterLoaded ? (
						<div className="text-center text-muted py-3">
							Loading roster...
						</div>
					) : filteredPlayers.length === 0 ? (
						<div className="text-center text-muted py-3">
							No players found
						</div>
					) : (
						filteredPlayers.map((p) => (
							<button
								key={p.pid}
								type="button"
								className="list-group-item list-group-item-action text-start border-0 border-bottom rounded-0"
								disabled={loadingPid !== null}
								onClick={() => handleSelectPlayer(p)}
							>
								<div className="d-flex justify-content-between align-items-center">
									<span>
										{p.firstName} {p.lastName}
									</span>
									<span className="text-muted small">
										{p.ratings.pos} · {p.ratings.ovr} OVR
									</span>
								</div>
							</button>
						))
					))}
			</div>
		</div>
	);
}
