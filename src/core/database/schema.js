import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const mySchema = appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: 'tickets',
      columns: [
        { name: 'remote_id', type: 'string' },
        { name: 'price_paid', type: 'number' },
        { name: 'zone_validity', type: 'string' },
        { name: 'cryptographic_signature', type: 'string' },
        { name: 'valid_from', type: 'number' },
        { name: 'valid_until', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'validation_logs',
      columns: [
        { name: 'ticket_id', type: 'string' },
        { name: 'scan_location_lat', type: 'number' },
        { name: 'scan_location_lng', type: 'number' },
        { name: 'scanned_at', type: 'number' },
        { name: 'is_cryptographically_valid', type: 'boolean' },
        { name: 'sync_status', type: 'string' },
      ],
    }),
    tableSchema({
      name: 'subscriptions',
      columns: [
        { name: 'remote_id', type: 'string' },
        { name: 'type_name', type: 'string' },
        { name: 'start_date', type: 'number' },
        { name: 'end_date', type: 'number' },
        { name: 'price_paid', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'incidents',
      columns: [
        { name: 'remote_id', type: 'string' },
        { name: 'incident_type', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'reported_at', type: 'number' },
        { name: 'sync_status', type: 'string' },
      ],
    }),
  ],
});
