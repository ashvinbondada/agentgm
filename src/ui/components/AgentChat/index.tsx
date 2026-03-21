import { useEffect } from "react";
import { isSport } from "../../../common/index.ts";
import { useAgentChatUi } from "../../util/agentChatUi.ts";
import { useLocalPartial } from "../../util/index.ts";
import { useViewData } from "../../util/viewManager.tsx";
import ChatView from "./ChatView.tsx";
import InboxView from "./InboxView.tsx";
import NewDmView from "./NewDmView.tsx";

const EmptyState = () => {
	const openNewDm = useAgentChatUi((s) => s.openNewDm);
	return (
		<div className="d-flex flex-column align-items-center justify-content-center h-100 text-center p-4">
			<div className="mb-3" style={{ fontSize: "3rem", opacity: 0.3 }}>
				💬
			</div>
			<h5 className="fw-semibold mb-1">Your messages</h5>
			<p className="text-muted small mb-3">Send a message to start a chat.</p>
			<button
				type="button"
				className="btn btn-primary"
				onClick={() => openNewDm()}
			>
				Send message
			</button>
		</div>
	);
};

export const AgentChatCore = ({ mode }: { mode: "panel" | "fullPage" }) => {
	const view = useAgentChatUi((s) => s.view);
	const activeConversationId = useAgentChatUi((s) => s.activeConversationId);
	const conversations = useAgentChatUi((s) => s.conversations);

	const activeConversation =
		conversations.find((c) => c.id === activeConversationId) ?? null;

	if (mode === "fullPage") {
		let mainContent: React.ReactNode;
		if (view === "chat" && activeConversation) {
			mainContent = <ChatView conversation={activeConversation} hideNav />;
		} else if (view === "newDm") {
			mainContent = <NewDmView />;
		} else {
			mainContent = <EmptyState />;
		}

		return (
			<div className="agent-messages-full d-flex border rounded" style={{ height: "calc(100vh - 200px)" }}>
				<div className="agent-messages-sidebar border-end d-flex flex-column">
					<InboxView
						activeId={activeConversationId}
						showHeader
					/>
				</div>
				<div
					className="flex-grow-1 d-flex flex-column"
					style={{ minWidth: 0, overflow: "hidden" }}
				>
					{mainContent}
				</div>
				<style>{agentChatStyles}</style>
			</div>
		);
	}

	let content: React.ReactNode;
	if (view === "chat" && activeConversation) {
		content = <ChatView conversation={activeConversation} />;
	} else if (view === "newDm") {
		content = <NewDmView />;
	} else {
		content = <InboxView />;
	}

	return (
		<div className="agent-messages-panel card shadow">
			{content}
			<style>{agentChatStyles}</style>
		</div>
	);
};

export const agentChatStyles = `
	.agent-messages-sidebar {
		width: 320px;
		min-width: 320px;
		max-width: 320px;
	}
	.agent-messages-panel {
		position: fixed;
		right: 16px;
		bottom: 72px;
		width: min(420px, calc(100vw - 32px));
		height: min(520px, calc(100vh - 120px));
		z-index: 1040;
		display: flex;
		flex-direction: column;
	}
	.agent-messages-full {
		min-height: 60vh;
	}
	.agent-messages-header {
		height: 45px;
		min-height: 45px;
	}
	.agent-messages-inbox-active {
		background: var(--bs-tertiary-bg, rgba(0, 0, 0, 0.04)) !important;
		color: inherit !important;
	}
	.agent-messages-messages {
		flex: 1;
		min-height: 0;
		max-height: 100%;
	}
	.agent-chat-avatar {
		align-self: flex-end;
		margin-bottom: 2px;
	}
	.agent-chat-bubble {
		max-width: 85%;
		padding: 0.5rem 0.75rem;
		border-radius: 1rem;
		word-break: break-word;
	}
	.agent-chat-bubble-user {
		background: var(--bs-primary, #0d6efd);
		color: #fff;
		border-bottom-right-radius: 0.25rem;
	}
	.agent-chat-bubble-user a {
		color: #cfe2ff;
	}
	.agent-chat-bubble-assistant {
		background: var(--bs-secondary-bg, rgba(0, 0, 0, 0.06));
		border-bottom-left-radius: 0.25rem;
	}
	.agent-chat-msg.role-user .agent-messages-text {
		white-space: pre-wrap;
	}
	.agent-messages-md {
		font-size: 0.9375rem;
		line-height: 1.45;
	}
	.agent-messages-md :first-child {
		margin-top: 0;
	}
	.agent-messages-md :last-child {
		margin-bottom: 0;
	}
	.agent-messages-md p {
		margin: 0.35em 0;
	}
	.agent-messages-md h1,
	.agent-messages-md h2,
	.agent-messages-md h3,
	.agent-messages-md h4 {
		font-size: 1rem;
		font-weight: 600;
		margin: 0.65em 0 0.35em;
	}
	.agent-messages-md ul,
	.agent-messages-md ol {
		margin: 0.35em 0;
		padding-left: 1.25rem;
	}
	.agent-messages-md li {
		margin: 0.15em 0;
	}
	.agent-messages-md strong {
		font-weight: 600;
	}
	.agent-messages-md a {
		word-break: break-word;
	}
	.agent-messages-md code {
		font-size: 0.8125rem;
	}
	.agent-messages-md :not(pre) > code {
		padding: 0.15em 0.35em;
		border-radius: 0.25rem;
		background: var(--bs-secondary-bg, rgba(0, 0, 0, 0.06));
	}
	.agent-messages-md pre {
		font-size: 0.8125rem;
		margin: 0.5em 0;
		padding: 0.5rem 0.75rem;
		overflow-x: auto;
		border-radius: 0.375rem;
		background: var(--bs-secondary-bg, rgba(0, 0, 0, 0.05));
	}
	.agent-messages-md pre code {
		padding: 0;
		background: none;
	}
	.agent-messages-md blockquote {
		margin: 0.5em 0;
		padding: 0.25rem 0 0.25rem 0.75rem;
		border-left: 3px solid var(--bs-border-color, #dee2e6);
		color: var(--bs-secondary-color, #6c757d);
	}
	.agent-messages-md hr {
		margin: 0.75em 0;
		border: none;
		border-top: 1px solid var(--bs-border-color, #dee2e6);
	}
	.agent-messages-md table {
		width: 100%;
		margin: 0.5em 0;
		border-collapse: collapse;
		font-size: 0.85rem;
	}
	.agent-messages-md th,
	.agent-messages-md td {
		padding: 0.35rem 0.6rem;
		border: 1px solid var(--bs-border-color, #dee2e6);
		text-align: left;
	}
	.agent-messages-md th {
		font-weight: 600;
		background: var(--bs-tertiary-bg, rgba(0, 0, 0, 0.03));
	}
	.agent-messages-md tbody tr:hover {
		background: var(--bs-tertiary-bg, rgba(0, 0, 0, 0.02));
	}

	/* Typing indicator */
	.agent-chat-typing {
		padding: 4px 0;
		animation: agent-messages-pulse 1.5s ease-in-out infinite;
	}
	@keyframes agent-messages-pulse {
		0%, 100% { opacity: 0.4; }
		50% { opacity: 1; }
	}

	/* Streaming cursor */
	.agent-messages-cursor {
		display: inline-block;
		width: 2px;
		height: 1em;
		background: currentColor;
		margin-left: 1px;
		vertical-align: text-bottom;
		animation: agent-messages-blink 0.8s step-end infinite;
	}
	@keyframes agent-messages-blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0; }
	}

	/* Streaming text fade-in */
	.agent-messages-streaming {
		animation: agent-messages-fadein 0.15s ease-out;
	}
	@keyframes agent-messages-fadein {
		from { opacity: 0.7; }
		to { opacity: 1; }
	}
`;

const AgentChat = () => {
	const open = useAgentChatUi((s) => s.open);
	const toggle = useAgentChatUi((s) => s.toggle);
	const syncLid = useAgentChatUi((s) => s.syncLid);
	const pageID = useViewData((s) => s.idLoading ?? s.idLoaded);
	const { lid } = useLocalPartial(["lid"]);

	useEffect(() => {
		syncLid(lid);
	}, [lid, syncLid]);

	if (!isSport("basketball")) {
		return null;
	}

	if (pageID === "agentChat") {
		return null;
	}

	return (
		<>
			<button
				type="button"
				className="btn btn-primary shadow agent-messages-fab"
				onClick={() => toggle()}
				title="My Staff chat"
				aria-expanded={open}
			>
				AI
			</button>
			{open ? <AgentChatCore mode="panel" /> : null}
			<style>{`
				.agent-messages-fab {
					position: fixed;
					right: 16px;
					bottom: 16px;
					z-index: 1040;
					border-radius: 50%;
					width: 48px;
					height: 48px;
					padding: 0;
					line-height: 48px;
				}
			`}</style>
		</>
	);
};

export default AgentChat;
