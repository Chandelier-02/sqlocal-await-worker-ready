import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createSQLocal } from '../src/client.js';

describe('destroy', async () => {
	const { sql, destroy } = await createSQLocal('destroy-test.sqlite3');

	beforeEach(async () => {
		await sql`CREATE TABLE groceries (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)`;
	});

	afterEach(async () => {
		const { sql } = await createSQLocal('destroy-test.sqlite3');
		await sql`DROP TABLE groceries`;
	});

	it('should destroy the client', async () => {
		const insert1 =
			await sql`INSERT INTO groceries (name) VALUES ('pasta') RETURNING name`;
		expect(insert1).toEqual([{ name: 'pasta' }]);

		await destroy();

		const insert2Fn = async () =>
			await sql`INSERT INTO groceries (name) VALUES ('sauce') RETURNING name`;
		await expect(insert2Fn).rejects.toThrowError();
	});
});
