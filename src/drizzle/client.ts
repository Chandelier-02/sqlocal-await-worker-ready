import { SQLocal } from '../index.js';
import type { ClientConfig, RawResultData, Sqlite3Method } from '../types.js';

export const createSQLocalDrizzle = async (
	config: string | ClientConfig
): Promise<SQLocalDrizzle> => {
	const normalizedConfig =
		typeof config === 'string' ? { databasePath: config } : config;
	const sqlocalDrizzle = new SQLocalDrizzle(normalizedConfig);
	await sqlocalDrizzle.waitReady();
	return sqlocalDrizzle;
};

export class SQLocalDrizzle extends SQLocal {
	constructor(config: ClientConfig) {
		super(config);
	}

	driver = async (
		sql: string,
		params: unknown[],
		method: Sqlite3Method
	): Promise<RawResultData> => {
		if (/^begin\b/i.test(sql)) {
			console.warn(
				"Drizzle's transaction method cannot isolate transactions from outside queries. It is recommended to use the transaction method of SQLocalDrizzle instead (See https://sqlocal.dallashoffman.com/api/transaction#drizzle)."
			);
		}
		return await this.exec(sql, params, method);
	};

	batchDriver = async (
		queries: { sql: string; params: unknown[]; method: Sqlite3Method }[]
	): Promise<RawResultData[]> => {
		return await this.execBatch(queries);
	};
}
