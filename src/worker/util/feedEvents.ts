import toUI from "./toUI.ts";
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
	toUI("feedEvent", [event]);
}
