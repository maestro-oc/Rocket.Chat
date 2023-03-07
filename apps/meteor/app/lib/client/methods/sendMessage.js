import { Meteor } from 'meteor/meteor';

import { ChatMessage, Rooms } from '../../../models/client';
import { settings } from '../../../settings';
import { callbacks } from '../../../../lib/callbacks';
import { t, shouldUseRealName } from '../../../utils/client';
import { dispatchToastMessage } from '../../../../client/lib/toast';
import { onClientMessageReceived } from '../../../../client/lib/onClientMessageReceived';
import { trim } from '../../../../lib/utils/stringUtils';

Meteor.methods({
	sendMessage(message) {
		if (!Meteor.userId() || trim(message.msg) === '') {
			return false;
		}
		const messageAlreadyExists = message._id && ChatMessage.findOne({ _id: message._id });
		if (messageAlreadyExists) {
			return dispatchToastMessage({ type: 'error', message: t('Message_Already_Sent') });
		}
		const user = Meteor.user();
		message.ts = new Date();
		message.u = {
			_id: Meteor.userId(),
			username: user.username,
		};
		if (shouldUseRealName(message.u._id)) {
			message.u.name = user.name;
		}
		message.temp = true;
		if (settings.get('Message_Read_Receipt_Enabled')) {
			message.unread = true;
		}

		// If the room is federated, send the message to matrix only
		const { federated } = Rooms.findOne({ _id: message.rid }, { fields: { federated: 1 } });
		if (federated) {
			return;
		}

		message = callbacks.run('beforeSaveMessage', message);
		onClientMessageReceived(message).then(function (message) {
			ChatMessage.insert(message);
			return callbacks.run('afterSaveMessage', message);
		});
	},
});
