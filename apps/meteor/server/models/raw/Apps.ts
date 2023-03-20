import type { Db } from 'mongodb';
import type { IAppsModel } from '@rocket.chat/model-typings';

import { BaseRaw } from './BaseRaw';

export class AppsModel extends BaseRaw<any> implements IAppsModel {
	constructor(db: Db) {
		super(db, 'apps');
	}
}
