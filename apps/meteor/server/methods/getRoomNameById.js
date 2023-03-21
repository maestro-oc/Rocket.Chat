import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Subscriptions } from '@rocket.chat/models';

import { Rooms } from '../../app/models/server';
import { hasPermission } from '../../app/authorization/server';

Meteor.methods({
	async getRoomNameById(rid) {
		check(rid, String);
		const userId = Meteor.userId();
		if (!userId) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'getRoomNameById',
			});
		}

		const room = Rooms.findOneById(rid);

		if (room == null) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'getRoomNameById',
			});
		}

		const subscription = await Subscriptions.findOneByRoomIdAndUserId(rid, userId, {
			projection: { _id: 1 },
		});
		if (subscription) {
			return room.name;
		}

		if (room.t !== 'c' || hasPermission(userId, 'view-c-room') !== true) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'getRoomNameById',
			});
		}

		return room.name;
	},
});
