export class SocketSubscription {
  constructor(public unsubscribe: () => void) {
  }
}
