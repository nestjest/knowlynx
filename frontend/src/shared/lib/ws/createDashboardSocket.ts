type DashboardSocketHandlers = {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: () => void;
};

type DashboardSocketConnection = {
  disconnect: () => void;
};

const DEFAULT_WS_URL = 'ws://localhost:8080/ws';

export function createDashboardSocket(
  handlers: DashboardSocketHandlers = {}
): DashboardSocketConnection {
  if (typeof window === 'undefined' || typeof window.WebSocket === 'undefined') {
    return { disconnect() {} };
  }

  let socket: WebSocket | undefined;

  try {
    socket = new WebSocket(DEFAULT_WS_URL);
    socket.addEventListener('open', () => handlers.onOpen?.());
    socket.addEventListener('close', () => handlers.onClose?.());
    socket.addEventListener('error', () => handlers.onError?.());
  } catch {
    handlers.onError?.();
  }

  return {
    disconnect() {
      if (socket && socket.readyState < WebSocket.CLOSING) {
        socket.close();
      }
    }
  };
}
