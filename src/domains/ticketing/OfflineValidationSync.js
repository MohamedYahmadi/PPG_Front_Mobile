import { database } from '../../core/database';
import { Q } from '@nozbe/watermelondb';
import api from '../../core/api/client';

class OfflineValidationSync {
  static async syncPendingLogs() {
    try {
      const validationLogsCollection = database.get('validation_logs');
      const pendingLogs = await validationLogsCollection
        .query(Q.where('sync_status', 'PENDING'))
        .fetch();

      if (pendingLogs.length === 0) return;

      const payload = pendingLogs.map((log) => ({
        ticket_id: log.ticket_id,
        scan_location_lat: log.scan_location_lat,
        scan_location_lng: log.scan_location_lng,
        scanned_at: new Date(log.scanned_at).toISOString(),
        is_cryptographically_valid: log.is_cryptographically_valid,
        device_id: 'controller_mobile',
      }));

      const response = await api.post('/tickets/validate/sync/', payload);

      if (response.status === 201) {
        await database.write(async () => {
          for (const log of pendingLogs) {
            await log.update((l) => {
              l.sync_status = 'SYNCED';
            });
          }
        });
      }
    } catch (error) {
      console.error('[OfflineValidationSync] Sync failed:', error);
    }
  }
}

export default OfflineValidationSync;
