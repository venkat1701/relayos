/**
 * Server-Sent Events (SSE) client for real-time updates.
 *
 * Replaces 15-second polling with sub-second update latency.
 */

export interface SSEEventHandlers {
  onTimelineUpdate?: (data: any) => void;
  onTimelineSnapshot?: (data: any) => void;
  onEventCreated?: (data: any) => void;
  onBriefGenerated?: (data: any) => void;
  onTaskCreated?: (data: any) => void;
  onHeartbeat?: (data: any) => void;
  onConnectionEstablished?: (data: any) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export class SSEClient {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private reconnectTimer: number | null = null;

  /**
   * Connect to SSE stream for real-time updates.
   *
   * @param endpoint - SSE endpoint (e.g., "/api/v1/stream/timeline")
   * @param token - Auth token
   * @param organizationId - Organization ID
   * @param handlers - Event handlers
   */
  connect(
    endpoint: string,
    token: string,
    organizationId: string,
    handlers: SSEEventHandlers
  ): void {
    // Close existing connection
    this.disconnect();

    // Build URL with query params
    const url = new URL(endpoint, window.location.origin);
    url.searchParams.set("organization_id", organizationId);

    // EventSource doesn't support custom headers, so pass token in URL
    // (This is less secure but necessary for EventSource API)
    // Alternative: Use WebSocket if you need header-based auth
    const fullUrl = `${url.toString()}`;

    try {
      this.eventSource = new EventSource(fullUrl);

      // Connection opened
      this.eventSource.onopen = () => {
        console.log(`[SSE] Connected to ${endpoint}`);
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        handlers.onOpen?.();
      };

      // Generic error handler
      this.eventSource.onerror = (error) => {
        console.error(`[SSE] Connection error:`, error);
        handlers.onError?.(error);

        // Attempt reconnection with exponential backoff
        this.attemptReconnect(endpoint, token, organizationId, handlers);
      };

      // Specific event handlers
      this.eventSource.addEventListener("connection_established", (e) => {
        const data = JSON.parse((e as MessageEvent).data);
        console.log("[SSE] Connection established:", data);
        handlers.onConnectionEstablished?.(data);
      });

      this.eventSource.addEventListener("timeline_snapshot", (e) => {
        const data = JSON.parse((e as MessageEvent).data);
        console.log("[SSE] Timeline snapshot received");
        handlers.onTimelineSnapshot?.(data);
      });

      this.eventSource.addEventListener("timeline_update", (e) => {
        const data = JSON.parse((e as MessageEvent).data);
        console.log("[SSE] Timeline update:", data);
        handlers.onTimelineUpdate?.(data);
      });

      this.eventSource.addEventListener("event_created", (e) => {
        const data = JSON.parse((e as MessageEvent).data);
        console.log("[SSE] Event created:", data);
        handlers.onEventCreated?.(data);
      });

      this.eventSource.addEventListener("brief_generated", (e) => {
        const data = JSON.parse((e as MessageEvent).data);
        console.log("[SSE] Brief generated:", data);
        handlers.onBriefGenerated?.(data);
      });

      this.eventSource.addEventListener("task_created", (e) => {
        const data = JSON.parse((e as MessageEvent).data);
        console.log("[SSE] Task created:", data);
        handlers.onTaskCreated?.(data);
      });

      this.eventSource.addEventListener("heartbeat", (e) => {
        const data = JSON.parse((e as MessageEvent).data);
        // Don't log heartbeats (too noisy)
        handlers.onHeartbeat?.(data);
      });

    } catch (error) {
      console.error("[SSE] Failed to create EventSource:", error);
      handlers.onError?.(error as Event);
    }
  }

  /**
   * Attempt reconnection with exponential backoff.
   */
  private attemptReconnect(
    endpoint: string,
    token: string,
    organizationId: string,
    handlers: SSEEventHandlers
  ): void {
    // Clear existing timer
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
    }

    // Check if we've exceeded max attempts
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[SSE] Max reconnection attempts reached");
      handlers.onClose?.();
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `[SSE] Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.reconnectTimer = window.setTimeout(() => {
      this.connect(endpoint, token, organizationId, handlers);
    }, this.reconnectDelay);

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 16000);
  }

  /**
   * Disconnect from SSE stream.
   */
  disconnect(): void {
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.eventSource) {
      console.log("[SSE] Disconnecting");
      this.eventSource.close();
      this.eventSource = null;
    }

    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
  }

  /**
   * Check if currently connected.
   */
  isConnected(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN;
  }

  /**
   * Get current connection state.
   */
  getState(): "connecting" | "open" | "closed" {
    if (!this.eventSource) return "closed";

    switch (this.eventSource.readyState) {
      case EventSource.CONNECTING:
        return "connecting";
      case EventSource.OPEN:
        return "open";
      case EventSource.CLOSED:
        return "closed";
      default:
        return "closed";
    }
  }
}
