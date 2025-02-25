import { Authorization } from '@rocket.chat/core-services';
import type { IAuthorization } from '@rocket.chat/core-services';

export const canAccessRoomAsync = Authorization.canAccessRoom;
export const canAccessRoomIdAsync = Authorization.canAccessRoomId;
export const roomAccessAttributes = {
	_id: 1,
	t: 1,
	teamId: 1,
	prid: 1,
};

/* deprecated */
export const canAccessRoom = (...args: Parameters<IAuthorization['canAccessRoom']>): boolean => Promise.await(canAccessRoomAsync(...args));
export const canAccessRoomId = (...args: Parameters<IAuthorization['canAccessRoomId']>): boolean =>
	Promise.await(canAccessRoomIdAsync(...args));
