import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class ValidationLog extends Model {
  static table = 'validation_logs';

  @field('ticket_id') ticket_id;
  @field('scan_location_lat') scan_location_lat;
  @field('scan_location_lng') scan_location_lng;
  @field('scanned_at') scanned_at;
  @field('is_cryptographically_valid') is_cryptographically_valid;
  @field('sync_status') sync_status;
}
