import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Subscription extends Model {
  static table = 'subscriptions';

  @field('remote_id') remote_id;
  @field('type_name') type_name;
  @field('start_date') start_date;
  @field('end_date') end_date;
  @field('price_paid') price_paid;
  @field('status') status;
  @field('created_at') created_at;
}
