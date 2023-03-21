import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { Subscriptions } from '@rocket.chat/models';

import { hasPermission } from '../../app/authorization/server';
import { callbacks } from '../../lib/callbacks';
import { Rooms, Users, Messages } from '../../app/models/server';
import { roomCoordinator } from '../lib/rooms/roomCoordinator';
import { RoomMemberActions } from '../../definition/IRoomTypeConfig';

Meteor.methods({
	async unmuteUserInRoom(data) {
		const fromId = Meteor.userId();

		check(
			data,
			Match.ObjectIncluding({
				rid: String,
				username: String,
			}),
		);

		if (!hasPermission(fromId, 'mute-user', data.rid)) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'unmuteUserInRoom',
			});
		}

		const room = Rooms.findOneById(data.rid);

		if (!room) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', {
				method: 'unmuteUserInRoom',
			});
		}

		if (!roomCoordinator.getRoomDirectives(room.t)?.allowMemberAction(room, RoomMemberActions.MUTE, fromId)) {
			throw new Meteor.Error('error-invalid-room-type', `${room.t} is not a valid room type`, {
				method: 'unmuteUserInRoom',
				type: room.t,
			});
		}

		const subscription = await Subscriptions.findOneByRoomIdAndUsername(data.rid, data.username, {
			projection: { _id: 1 },
		});

		if (!subscription) {
			throw new Meteor.Error('error-user-not-in-room', 'User is not in this room', {
				method: 'unmuteUserInRoom',
			});
		}

		const unmutedUser = Users.findOneByUsernameIgnoringCase(data.username);

		const fromUser = Users.findOneById(fromId);

		callbacks.run('beforeUnmuteUser', { unmutedUser, fromUser }, room);

		Rooms.unmuteUsernameByRoomId(data.rid, unmutedUser.username);

		Messages.createUserUnmutedWithRoomIdAndUser(data.rid, unmutedUser, {
			u: {
				_id: fromUser._id,
				username: fromUser.username,
			},
		});

		Meteor.defer(function () {
			callbacks.run('afterUnmuteUser', { unmutedUser, fromUser }, room);
		});

		return true;
	},
});
