import type {
	IMessage,
	IRoom,
	IUser,
	ILivechatDepartment,
	ILivechatPriority,
	IOmnichannelServiceLevelAgreements,
	MessageTypesValues,
	MessageAttachment,
} from '@rocket.chat/core-typings';
import type {
	AggregationCursor,
	CountDocumentsOptions,
	FindCursor,
	FindOptions,
	AggregateOptions,
	InsertOneResult,
	DeleteResult,
	UpdateResult,
	Document,
} from 'mongodb';

import type { FindPaginated, IBaseModel } from './IBaseModel';

export interface IMessagesModel extends IBaseModel<IMessage> {
	findPaginatedVisibleByMentionAndRoomId(
		username: IUser['username'],
		rid: IRoom['_id'],
		options?: FindOptions<IMessage>,
	): FindPaginated<FindCursor<IMessage>>;

	findVisibleByMentionAndRoomId(username: IUser['username'], rid: IRoom['_id'], options?: FindOptions<IMessage>): FindCursor<IMessage>;

	findStarredByUserAtRoom(userId: IUser['_id'], roomId: IRoom['_id'], options?: FindOptions<IMessage>): FindPaginated<FindCursor<IMessage>>;

	findPaginatedByRoomIdAndType(
		roomId: IRoom['_id'],
		type: IMessage['t'],
		options?: FindOptions<IMessage>,
	): FindPaginated<FindCursor<IMessage>>;

	findDiscussionsByRoom(rid: IRoom['_id'], options?: FindOptions<IMessage>): FindCursor<IMessage>;

	findDiscussionsByRoomAndText(rid: IRoom['_id'], text: string, options?: FindOptions<IMessage>): FindPaginated<FindCursor<IMessage>>;

	findAllNumberOfTransferredRooms(params: {
		start: string;
		end: string;
		departmentId: ILivechatDepartment['_id'];
		onlyCount: boolean;
		options: any;
	}): AggregationCursor<any>;

	getTotalOfMessagesSentByDate(params: { start: Date; end: Date; options?: any }): Promise<any[]>;

	findLivechatClosedMessages(rid: IRoom['_id'], searchTerm?: string, options?: FindOptions<IMessage>): FindPaginated<FindCursor<IMessage>>;
	findLivechatMessages(rid: IRoom['_id'], options?: FindOptions<IMessage>): FindCursor<IMessage>;
	findLivechatMessagesWithoutClosing(rid: IRoom['_id'], options?: FindOptions<IMessage>): FindCursor<IMessage>;
	countRoomsWithStarredMessages(options: AggregateOptions): Promise<number>;

	countRoomsWithPinnedMessages(options: AggregateOptions): Promise<number>;

	findPinned(options?: FindOptions<IMessage>): FindCursor<IMessage>;

	findStarred(options?: FindOptions<IMessage>): FindCursor<IMessage>;

	setBlocksById(_id: string, blocks: Required<IMessage>['blocks']): Promise<void>;

	addBlocksById(_id: string, blocks: Required<IMessage>['blocks']): Promise<void>;

	countRoomsWithMessageType(type: IMessage['t'], options: AggregateOptions): Promise<number>;

	countByType(type: IMessage['t'], options: CountDocumentsOptions): Promise<number>;

	findPaginatedPinnedByRoom(roomId: IMessage['rid'], options?: FindOptions<IMessage>): FindPaginated<FindCursor<IMessage>>;

	setFederationReactionEventId(username: string, _id: string, reaction: string, federationEventId: string): Promise<void>;

	unsetFederationReactionEventId(federationEventId: string, _id: string, reaction: string): Promise<void>;

	findOneByFederationIdAndUsernameOnReactions(federationEventId: string, username: string): Promise<IMessage | null>;

	findOneByFederationId(federationEventId: string): Promise<IMessage | null>;

	setFederationEventIdById(_id: string, federationEventId: string): Promise<void>;

	createPriorityHistoryWithRoomIdMessageAndUser(
		roomId: string,
		user: IMessage['u'],
		priority?: Pick<ILivechatPriority, 'name' | 'i18n'>,
	): Promise<InsertOneResult<IMessage>>;

	createSLAHistoryWithRoomIdMessageAndUser(
		roomId: string,
		user: IMessage['u'],
		sla?: Pick<IOmnichannelServiceLevelAgreements, 'name'>,
	): Promise<InsertOneResult<IMessage>>;

	removeByRoomId(roomId: IRoom['_id']): Promise<DeleteResult>;

	findVisibleByRoomIdNotContainingTypesAndUsers(
		roomId: IRoom['_id'],
		types: IMessage['t'][],
		users?: string[],
		options?: FindOptions<IMessage>,
		showThreadMessages?: boolean,
	): FindCursor<IMessage>;
	findVisibleByRoomIdNotContainingTypesBeforeTs(
		roomId: IRoom['_id'],
		types: IMessage['t'][],
		ts: Date,
		options?: FindOptions<IMessage>,
		showThreadMessages?: boolean,
	): FindCursor<IMessage>;

	findLivechatClosingMessage(rid: IRoom['_id'], options?: FindOptions<IMessage>): Promise<IMessage | null>;
	setReactions(messageId: string, reactions: IMessage['reactions']): Promise<UpdateResult>;
	keepHistoryForToken(token: string): Promise<UpdateResult | Document>;
	setRoomIdByToken(token: string, rid: string): Promise<UpdateResult | Document>;
	createRoomArchivedByRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createRoomUnarchivedByRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createRoomSetReadOnlyByRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createRoomRemovedReadOnlyByRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createRoomAllowedReactingByRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createRoomDisallowedReactingByRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	unsetReactions(messageId: string): Promise<UpdateResult>;
	deleteOldOTRMessages(roomId: string, ts: Date): Promise<DeleteResult>;
	updateOTRAck(_id: string, otrAck: string): Promise<UpdateResult>;
	createRoomSettingsChangedWithTypeRoomIdMessageAndUser(
		type: MessageTypesValues,
		roomId: string,
		message: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, any>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createRoomRenamedWithRoomIdRoomNameAndUser(
		roomId: string,
		roomName: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, any>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	addTranslations(messageId: string, translations: Record<string, string>, providerName: string): Promise<UpdateResult>;
	addAttachmentTranslations(messageId: string, attachmentIndex: string, translations: Record<string, string>): Promise<UpdateResult>;
	setImportFileRocketChatAttachment(
		importFileId: string,
		rocketChatUrl: string,
		attachment: MessageAttachment,
	): Promise<UpdateResult | Document>;
	countVisibleByRoomIdBetweenTimestampsInclusive(roomId: string, afterTimestamp: Date, beforeTimestamp: Date): Promise<number>;

	findByMention(username: string, options?: FindOptions<IMessage>): FindCursor<IMessage>;
	findVisibleThreadByThreadId(tmid: string, options?: FindOptions<IMessage>): FindCursor<IMessage>;

	findFilesByUserId(userId: string, options?: FindOptions<IMessage>): FindCursor<IMessage>;
	findVisibleByIds(ids: string[], options?: FindOptions<IMessage>): FindCursor<IMessage>;
	findVisibleByRoomIdNotContainingTypes(
		roomId: string,
		types: MessageTypesValues[],
		options?: FindOptions<IMessage>,
		showThreadMessages?: boolean,
	): FindCursor<IMessage>;
	findFilesByRoomIdPinnedTimestampAndUsers(
		rid: string,
		excludePinned: boolean,
		ignoreDiscussion: boolean,
		ts: Date,
		users: string[],
		ignoreThreads: boolean,
		options?: FindOptions<IMessage>,
	): FindCursor<IMessage>;
	findVisibleByRoomId(rid: string, options?: FindOptions<IMessage>): FindCursor<IMessage>;
	findDiscussionByRoomIdPinnedTimestampAndUsers(
		rid: string,
		excludePinned: boolean,
		ts: Date,
		users: string[],
		options?: FindOptions<IMessage>,
	): FindCursor<IMessage>;
	findVisibleByRoomIdAfterTimestamp(roomId: string, timestamp: Date, options?: FindOptions<IMessage>): FindCursor<IMessage>;
	findVisibleByRoomIdBeforeTimestampNotContainingTypes(
		roomId: string,
		timestamp: Date,
		types: MessageTypesValues[],
		options?: FindOptions<IMessage>,
		showThreadMessages?: boolean,
		inclusive?: boolean,
	): FindCursor<IMessage>;

	findVisibleByRoomIdBetweenTimestampsNotContainingTypes(
		roomId: string,
		afterTimestamp: Date,
		beforeTimestamp: Date,
		types: MessageTypesValues[],
		options?: FindOptions<IMessage>,
		showThreadMessages?: boolean,
		inclusive?: boolean,
	): FindCursor<IMessage>;
	findVisibleByRoomIdBeforeTimestamp(roomId: string, timestamp: Date, options?: FindOptions<IMessage>): FindCursor<IMessage>;
	getLastTimestamp(options?: FindOptions<IMessage>): Promise<Date | undefined>;
	findOneBySlackBotIdAndSlackTs(slackBotId: string, slackTs: Date): Promise<IMessage | null>;
	findByRoomIdAndMessageIds(rid: string, messageIds: string[], options?: FindOptions<IMessage>): FindCursor<IMessage>;
	findForUpdates(roomId: string, timestamp: Date, options?: FindOptions<IMessage>): FindCursor<IMessage>;
	updateUsernameOfEditByUserId(userId: string, username: string): Promise<UpdateResult | Document>;
	updateAllUsernamesByUserId(userId: string, username: string): Promise<UpdateResult | Document>;

	setUrlsById(_id: string, urls: NonNullable<IMessage['urls']>): Promise<UpdateResult>;
	getLastVisibleMessageSentWithNoTypeByRoomId(rid: string, messageId: string): Promise<IMessage | null>;

	findByRoomId(roomId: string, options?: FindOptions<IMessage>): FindCursor<IMessage>;
	findOneBySlackTs(slackTs: Date): Promise<IMessage | null>;

	cloneAndSaveAsHistoryById(_id: string, user: IMessage['u']): Promise<InsertOneResult<IMessage>>;

	setAsDeletedByIdAndUser(_id: string, user: IMessage['u']): Promise<UpdateResult>;
	setHiddenById(_id: string, hidden: boolean): Promise<UpdateResult>;
	setPinnedByIdAndUserId(
		_id: string,
		pinnedBy: Pick<IUser, '_id' | 'username'> | undefined,
		pinned?: boolean,
		pinnedAt?: Date,
	): Promise<UpdateResult>;
	findOneByRoomIdAndMessageId(rid: string, messageId: string, options?: FindOptions<IMessage>): Promise<IMessage | null>;

	updateUserStarById(_id: string, userId: string, starred?: boolean): Promise<UpdateResult>;
	updateUsernameAndMessageOfMentionByIdAndOldUsername(
		_id: string,
		oldUsername: string,
		newUsername: string,
		newMessage: string,
	): Promise<UpdateResult>;
	createWithTypeRoomIdMessageAndUser(
		type: MessageTypesValues,
		roomId: string,
		message: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	upgradeEtsToEditAt(): Promise<UpdateResult | Document>;
	unlinkUserId(userId: string, newUserId: string, newUsername: string, newNameAlias: string): Promise<UpdateResult | Document>;
	setSlackBotIdAndSlackTs(_id: string, slackBotId: string, slackTs: Date): Promise<UpdateResult>;
	setMessageAttachments(_id: string, attachments: IMessage['attachments']): Promise<UpdateResult>;

	createNavigationHistoryWithRoomIdMessageAndUser(
		roomId: string,
		message: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createUserLeaveWithRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createUserConvertChannelToTeamWithRoomIdAndUser(
		roomId: string,
		roomName: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createUserLeaveTeamWithRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createUserJoinWithRoomIdAndUserDiscussion(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createUserJoinTeamWithRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createUserConvertTeamToChannelWithRoomIdAndUser(
		roomId: string,
		roomName: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;

	createUserJoinWithRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createTranscriptHistoryWithRoomIdMessageAndUser(
		roomId: string,
		message: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createUserRemovedWithRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createUserRemoveRoomFromTeamWithRoomIdAndUser(
		roomId: string,
		roomName: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createUserAddRoomToTeamWithRoomIdAndUser(
		roomId: string,
		roomName: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createUserDeleteRoomFromTeamWithRoomIdAndUser(
		roomId: string,
		roomName: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createUserAddedWithRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createUserRemovedFromTeamWithRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;

	createUserAddedToTeamWithRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;

	createCommandWithRoomIdAndUser(
		command: string,
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createUserMutedWithRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createUserUnmutedWithRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createNewModeratorWithRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createModeratorRemovedWithRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;

	createNewOwnerWithRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createOtrSystemMessagesWithRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		id: MessageTypesValues,
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createSubscriptionRoleRemovedWithRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	removeByRoomIds(rids: string[]): Promise<DeleteResult>;
	removeById(_id: string): Promise<DeleteResult>;
	createOwnerRemovedWithRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createSubscriptionRoleAddedWithRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;
	createLeaderRemovedWithRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;

	createNewLeaderWithRoomIdAndUser(
		roomId: string,
		user: IMessage['u'],
		readReceiptsEnabled?: boolean,
		extraData?: Record<string, string>,
	): Promise<Omit<IMessage, '_updatedAt'>>;

	findThreadsByRoomIdPinnedTimestampAndUsers(
		data: { rid: string; pinned: boolean; ignoreDiscussion?: boolean; ts: Date; users: string[] },
		options?: FindOptions<IMessage>,
	): FindCursor<IMessage>;

	removeByIdPinnedTimestampLimitAndUsers(
		rid: string,
		pinned: boolean,
		ignoreDiscussion: boolean,
		ts: Date,
		limit: number,
		users: string[],
		ignoreThreads: boolean,
	): Promise<number>;
	removeByUserId(userId: string): Promise<DeleteResult>;
	getFirstReplyTsByThreadId(tmid: string): Promise<Pick<IMessage, 'ts'> | null>;
	getThreadFollowsByThreadId(tmid: string): Promise<string[] | undefined>;
	setVisibleMessagesAsRead(rid: string, until: Date): Promise<UpdateResult | Document>;
	getMessageByFileIdAndUsername(fileID: string, userId: string): Promise<IMessage | null>;
	getMessageByFileId(fileID: string): Promise<IMessage | null>;
	unsetThreadByThreadId(tmid: string): Promise<UpdateResult>;
	setThreadMessagesAsRead(tmid: string, until: Date): Promise<UpdateResult | Document>;
	updateRepliesByThreadId(tmid: string, replies: string[], ts: Date): Promise<UpdateResult>;
	refreshDiscussionMetadata({ rid }: { rid: string }): Promise<UpdateResult | Document | false>;
	updateThreadLastMessageAndCountByThreadId(tmid: string, tlm: Date, tcount: number): Promise<UpdateResult>;
	findUnreadThreadMessagesByDate(tmid: string, userId: string, after: Date): FindCursor<IMessage>;
	findVisibleUnreadMessagesByRoomAndDate(rid: string, after: Date): FindCursor<IMessage>;
	setAsReadById(_id: string): Promise<UpdateResult>;
	removeThreadRefByThreadId(tmid: string): Promise<UpdateResult | Document>;
	countThreads(): Promise<number>;
	addThreadFollowerByThreadId(tmid: string, userId: string): Promise<UpdateResult>;
	findAllImportedMessagesWithFilesToDownload(): FindCursor<IMessage>;
	findAgentLastMessageByVisitorLastMessageTs(roomId: string, visitorLastMessageTs: Date): Promise<IMessage | null>;
	removeThreadFollowerByThreadId(tmid: string, userId: string): Promise<UpdateResult>;

	findThreadsByRoomId(rid: string, skip: number, limit: number): FindCursor<IMessage>;
	decreaseReplyCountById(_id: string, inc?: number): Promise<UpdateResult>;
}
