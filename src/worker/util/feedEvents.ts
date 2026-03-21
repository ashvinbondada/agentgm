import toUI from "./toUI.ts";
import { getFeedWorker } from "./feedWorkerInstance.ts";
import type {
	FeedEvent,
	FeedEventType,
	SocialContext,
} from "../../common/types.feedEvent.ts";

export function emitFeedEvent(
	type: FeedEventType,
	context: SocialContext,
	eventMetadata?: Record<string, unknown>,
): void {
	const event: FeedEvent = {
		type,
		timestamp: Date.now(),
		context,
		...(eventMetadata !== undefined ? { eventMetadata } : {}),
	};

	// Forward the event to the Feed Worker for processing (API call + IDB write).
	const worker = getFeedWorker();
	if (worker !== null) {
		worker.postMessage(event);
	} else {
		console.warn(
			"[emitFeedEvent] Feed Worker not yet initialized; event dropped:",
			type,
		);
	}

	// Notify the UI thread so the SocialFeedPanel re-reads IDB.
	toUI("feedEvent", [event]);
}
