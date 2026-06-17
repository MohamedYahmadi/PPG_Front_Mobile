import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { mySchema } from './schema';
import Ticket from './models/Ticket';
import ValidationLog from './models/ValidationLog';
import Subscription from './models/Subscription';
import Incident from './models/Incident';

const adapter = new SQLiteAdapter({
  schema: mySchema,
  dbName: 'sitp_offline_db',
  jsi: true,
});

export const database = new Database({
  adapter,
  modelClasses: [Ticket, ValidationLog, Subscription, Incident],
});
