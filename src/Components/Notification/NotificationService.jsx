class NotificationService {
  constructor(userId, dispatch) {
    this.socket = null;
    this.userId = userId;
    this.listeners = [];
    this.dispatch = dispatch;
  }

  connect() {
    this.socket = new WebSocket(`ws://localhost:8000/ws/notification/${this.userId}/`);
    
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.listeners.forEach(listener => listener(data));
    };
    
    this.socket.onclose = () => {
      console.log('Notification WebSocket closed. Reconnecting...');
      setTimeout(() => this.connect(), 1000);
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
  
  addListener(listener) {
    this.listeners.push(listener);
  }
  
  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }
  
  close() {
    if (this.socket) {
      this.socket.close();
    }
  }
}

export default NotificationService;