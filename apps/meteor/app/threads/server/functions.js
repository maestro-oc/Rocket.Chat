import { Subscriptions } from '@rocket.chat/models';

import { Messages } from '../../models/server';
import { getMentions } from '../../lib/server/lib/notifyUsersOnMessage';

export const reply = async ({ tmid }, message, parentMessage, followers) => {
	const { rid, ts, u, editedAt } = message;
	if (!tmid || editedAt) {
		return false;
	}

	const { toAll, toHere, mentionIds } = getMentions(message);

	const addToReplies = [
		...new Set([
			...followers,
			...mentionIds,
			...(Array.isArray(parentMessage.replies) && parentMessage.replies.length ? [u._id] : [parentMessage.u._id, u._id]),
		]),
	];

	Messages.updateRepliesByThreadId(tmid, addToReplies, ts);

	const replies = Messages.getThreadFollowsByThreadId(tmid);

	const repliesFiltered = replies.filter((userId) => userId !== u._id).filter((userId) => !mentionIds.includes(userId));

	if (toAll || toHere) {
		await Subscriptions.addUnreadThreadByRoomIdAndUserIds(rid, repliesFiltered, tmid, {
			groupMention: true,
		});
	} else {
		await Subscriptions.addUnreadThreadByRoomIdAndUserIds(rid, repliesFiltered, tmid);
	}

	mentionIds.forEach((mentionId) => Subscriptions.addUnreadThreadByRoomIdAndUserIds(rid, [mentionId], tmid, { userMention: true }));
};

export const follow = ({ tmid, uid }) => {
	if (!tmid || !uid) {
		return false;
	}

	Messages.addThreadFollowerByThreadId(tmid, uid);
};

export const unfollow = async ({ tmid, rid, uid }) => {
	if (!tmid || !uid) {
		return false;
	}

	await Subscriptions.removeUnreadThreadByRoomIdAndUserId(rid, uid, tmid);

	return Messages.removeThreadFollowerByThreadId(tmid, uid);
};

export const readThread = async ({ userId, rid, tmid }) => {
	const projection = { tunread: 1 };
	const sub = await Subscriptions.findOneByRoomIdAndUserId(rid, userId, { projection });
	if (!sub) {
		return;
	}
	// if the thread being marked as read is the last one unread also clear the unread subscription flag
	const clearAlert = sub.tunread?.length <= 1 && sub.tunread.includes(tmid);

	await Subscriptions.removeUnreadThreadByRoomIdAndUserId(rid, userId, tmid, clearAlert);
};
