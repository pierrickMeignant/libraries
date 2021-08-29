export interface SocketSubscriber<T> {
  receive: (message: T | undefined) => void;
  error: (error: Event) => void;
  close: (close: CloseEvent) => void;
  open: (open: Event) => void;
  closed: boolean;
}
