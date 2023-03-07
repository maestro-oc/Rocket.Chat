import { Meteor } from 'meteor/meteor';
import type { IRoom, AtLeast } from '@rocket.chat/core-typings';
import { isRoomFederated } from '@rocket.chat/core-typings';

import { settings } from '../../../../app/settings/server';
import type { IRoomTypeServerDirectives } from '../../../../definition/IRoomTypeConfig';
import { RoomSettingsEnum, RoomMemberActions } from '../../../../definition/IRoomTypeConfig';
import { getDirectMessageRoomType } from '../../../../lib/rooms/roomTypes/direct';
import { roomCoordinator } from '../roomCoordinator';
import { Subscriptions } from '../../../../app/models/server';
import { Federation } from '../../../../app/federation-v2/server/Federation';
import { shouldUseRealName } from '../../../../app/utils/server';

export const DirectMessageRoomType = getDirectMessageRoomType(roomCoordinator);

const getCurrentUserId = (): string | undefined => {
	try {
		return Meteor.userId() || undefined;
	} catch (_e) {
		//
	}
};

roomCoordinator.add(DirectMessageRoomType, {
	allowRoomSettingChange(_room, setting) {
		if (isRoomFederated(_room)) {
			return Federation.isRoomSettingAllowed(_room, setting);
		}
		switch (setting) {
			case RoomSettingsEnum.TYPE:
			case RoomSettingsEnum.NAME:
			case RoomSettingsEnum.SYSTEM_MESSAGES:
			case RoomSettingsEnum.DESCRIPTION:
			case RoomSettingsEnum.READ_ONLY:
			case RoomSettingsEnum.REACT_WHEN_READ_ONLY:
			case RoomSettingsEnum.ARCHIVE_OR_UNARCHIVE:
			case RoomSettingsEnum.JOIN_CODE:
				return false;
			case RoomSettingsEnum.E2E:
				return settings.get('E2E_Enable') === true;
			default:
				return true;
		}
	},

	allowMemberAction(room: IRoom, action, userId) {
		if (isRoomFederated(room)) {
			return Federation.actionAllowed(room, action, userId);
		}
		switch (action) {
			case RoomMemberActions.BLOCK:
				return !this.isGroupChat(room);
			default:
				return false;
		}
	},

	roomName(room, userId?) {
		const subscription = ((): { fname?: string; name?: string } | undefined => {
			if (room.fname || room.name) {
				return {
					fname: room.fname,
					name: room.name,
				};
			}

			if (!room._id) {
				return undefined;
			}

			const uid = userId || getCurrentUserId();
			if (uid) {
				return Subscriptions.findOneByRoomIdAndUserId(room._id, uid, { fields: { name: 1, fname: 1 } });
			}

			// If we don't know what user is requesting the roomName, then any subscription will do
			return Subscriptions.findOne({ rid: room._id }, { fields: { name: 1, fname: 1 } });
		})();

		const uid = userId || getCurrentUserId();

		if (!subscription || !uid) {
			return;
		}

		const useRealName = shouldUseRealName(uid);
		if (useRealName && room.fname) {
			return subscription.fname;
		}

		return subscription.name;
	},

	isGroupChat(room) {
		return (room?.uids?.length || 0) > 2;
	},

	getNotificationDetails(room, sender, notificationMessage, userId) {
		const useRealName = shouldUseRealName(userId);

		if (this.isGroupChat(room)) {
			return {
				title: this.roomName(room, userId),
				text: `${(useRealName && sender.name) || sender.username}: ${notificationMessage}`,
			};
		}

		return {
			title: (useRealName && sender.name) || sender.username,
			text: notificationMessage,
		};
	},

	includeInDashboard() {
		return true;
	},
} as AtLeast<IRoomTypeServerDirectives, 'isGroupChat' | 'roomName'>);
