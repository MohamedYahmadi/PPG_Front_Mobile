const API_HOST = process.env.EXPO_PUBLIC_API_URL
  ? process.env.EXPO_PUBLIC_API_URL.replace('https://', '').replace('http://', '').split(':')[0]
  : '127.0.0.1';

const API_PORT = process.env.EXPO_PUBLIC_API_URL
  ? process.env.EXPO_PUBLIC_API_URL.split(':')[2]?.replace(/\/.*$/, '') || '8000'
  : '8000';

class LiveMapService {
  constructor(tripId, token) {
    this.wsUrl = `ws://${API_HOST}:${API_PORT}/ws/transit/trip/${tripId}/?token=${token || ''}`;
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
    this.onMessageCallback = null;
  }

  connect(onMessageCallback, onStatusChange) {
    this.onMessageCallback = onMessageCallback;
    this._connect(onStatusChange);
  }

  _connect(onStatusChange) {
    try {
      this.socket = new WebSocket(this.wsUrl);
    } catch (e) {
      console.error('[LiveMapService] WebSocket creation failed:', e);
      return;
    }

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      if (onStatusChange) onStatusChange('connected');
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'gps_update' && this.onMessageCallback) {
          this.onMessageCallback(
            data.payload.lat,
            data.payload.lng,
            data.payload.speed,
            data.payload.heading
          );
        }
      } catch (e) {
        console.warn('[LiveMapService] Invalid message:', e);
      }
    };

    this.socket.onclose = () => {
      if (onStatusChange) onStatusChange('disconnected');
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this._connect(onStatusChange), this.reconnectDelay * this.reconnectAttempts);
      }
    };

    this.socket.onerror = (err) => {
      console.error('[LiveMapService] WebSocket error:', err);
    };
  }

  sendGpsDriver(lat, lng, speed, heading) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'driver_gps_push',
        payload: { lat, lng, speed, heading },
      }));
    }
  }

  disconnect() {
    this.maxReconnectAttempts = 0;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export default LiveMapService;
