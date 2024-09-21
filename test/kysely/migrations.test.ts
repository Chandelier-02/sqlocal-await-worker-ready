import { afterEach, describe, expect, it } from 'vitest';
import { Kysely, Migrator } from 'kysely';
import { createSQLocalKysely } from '../../src/kysely/client.js';

describe('kysely migrations', async () => {
	const databasePath = 'kysely-migrations-test.sqlite3';
	const { dialect } = await createSQLocalKysely(databasePath);
	const db = new Kysely({ dialect });

	const migrator = new Migrator({
		db,
		provider: {
			async getMigrations() {
				const { migrations } = await import('./migrations/index.js');
				return migrations;
			},
		},
	});

	const getTableNames = async () => {
		const tables = await db.introspection.getTables();
		return tables.map((table) => table.name);
	};

	const getColumnNames = async (tableName: string) => {
		const tables = await db.introspection.getTables();
		const table = tables.find((table) => table.name === tableName);
		return table?.columns.map((column) => column.name);
	};

	afterEach(async () => {
		const opfs = await navigator.storage.getDirectory();
		await opfs.removeEntry(databasePath);
	});

	it('should migrate the database', async () => {
		expect(await getTableNames()).toEqual([]);

		await migrator.migrateToLatest();
		expect(await getTableNames()).toEqual(['groceries']);
		expect(await getColumnNames('groceries')).toEqual([
			'id',
			'name',
			'quantity',
		]);

		await migrator.migrateDown();
		expect(await getTableNames()).toEqual(['groceries']);
		expect(await getColumnNames('groceries')).toEqual(['id', 'name']);

		await migrator.migrateDown();
		expect(await getTableNames()).toEqual([]);

		await migrator.migrateUp();
		expect(await getTableNames()).toEqual(['groceries']);
		expect(await getColumnNames('groceries')).toEqual(['id', 'name']);

		await migrator.migrateDown();
		expect(await getTableNames()).toEqual([]);
	});
});
