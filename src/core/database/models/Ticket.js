import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Ticket extends Model {
  static table = 'tickets';

  @field('remote_id') remote_id;
  @field('price_paid') price_paid;
  @field('zone_validity') zone_validity;
  @field('cryptographic_signature') cryptographic_signature;
  @field('valid_from') valid_from;
  @field('valid_until') valid_until;
  @field('status') status;
  @field('created_at') created_at;
}
