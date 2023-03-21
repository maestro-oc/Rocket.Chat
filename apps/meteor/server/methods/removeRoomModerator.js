import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { api, Team } from '@rocket.chat/core-services';
import { isRoomFederated } from '@rocket.chat/core-typings';
import { Subscriptions } from '@rocket.chat/models';

import { hasPermission } from '../../app/authorization/server';
import { Users, Messages, Rooms } from '../../app/models/server';
import { settings } from '../../app/settings/server';

Meteor.methods({
	async removeRoomModerator(rid, userId) {
		check(rid, String);
		check(userId, String);

		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'removeRoomModerator',
			});
		}

		const room = Rooms.findOneById(rid, { fields: { t: 1, federated: 1 } });
		if (!hasPermission(Meteor.userId(), 'set-moderator', rid) && !isRoomFederated(room)) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'removeRoomModerator',
			});
		}

		const user = Users.findOneById(userId);

		if (!user || !user.username) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'removeRoomModerator',
			});
		}

		const subscription = await Subscriptions.findOneByRoomIdAndUserId(rid, user._id);

		if (!subscription) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', {
				method: 'removeRoomModerator',
			});
		}

		if (Array.isArray(subscription.roles) === false || subscription.roles.includes('moderator') === false) {
			throw new Meteor.Error('error-user-not-moderator', 'User is not a moderator', {
				method: 'removeRoomModerator',
			});
		}

		await Subscriptions.removeRoleById(subscription._id, 'moderator');

		const fromUser = Users.findOneById(Meteor.userId());

		Messages.createSubscriptionRoleRemovedWithRoomIdAndUser(rid, user, {
			u: {
				_id: fromUser._id,
				username: fromUser.username,
			},
			role: 'moderator',
		});

		const team = await Team.getOneByMainRoomId(rid);
		if (team) {
			await Team.removeRolesFromMember(team._id, userId, ['moderator']);
		}

		const event = {
			type: 'removed',
			_id: 'moderator',
			u: {
				_id: user._id,
				username: user.username,
				name: user.name,
			},
			scope: rid,
		};
		if (settings.get('UI_DisplayRoles')) {
			void api.broadcast('user.roleUpdate', event);
		}
		void api.broadcast('federation.userRoleChanged', { ...event, givenByUserId: Meteor.userId() });

		return true;
	},
});
