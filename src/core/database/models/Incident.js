import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Incident extends Model {
  static table = 'incidents';

  @field('remote_id') remote_id;
  @field('incident_type') incident_type;
  @field('description') description;
  @field('latitude') latitude;
  @field('longitude') longitude;
  @field('status') status;
  @field('reported_at') reported_at;
  @field('sync_status') sync_status;
}
