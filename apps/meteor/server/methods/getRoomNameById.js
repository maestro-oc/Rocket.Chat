import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Rooms, Subscriptions } from '../../app/models/server';
import { hasPermissionAsync } from '../../app/authorization/server/functions/hasPermission';

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

		const subscription = Subscriptions.findOneByRoomIdAndUserId(rid, userId, {
			fields: { _id: 1 },
		});
		if (subscription) {
			return room.name;
		}

		if (room.t !== 'c' || (await hasPermissionAsync(userId, 'view-c-room')) !== true) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'getRoomNameById',
			});
		}

		return room.name;
	},
});
