import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { mySchema } from './schema';

const adapter = new SQLiteAdapter({
  schema: mySchema,
  dbName: 'sitp_offline_db',
  jsi: true,
});

export const database = new Database({
  adapter,
  modelClasses: [],
});
