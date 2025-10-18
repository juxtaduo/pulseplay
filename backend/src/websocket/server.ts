import { WebSocketServer, WebSocket } from 'ws';
import { logger } from '../config/logger.js';
import { WSMessageType, type WSMessage } from '../types/index.js';

/**
 * WebSocket server for real-time rhythm updates
 * @module websocket/server
 */

const HEARTBEAT_INTERVAL = 30000; // 30 seconds

interface ExtendedWebSocket extends WebSocket {
	isAlive: boolean;
	userId?: string;
}

/**
 * Creates and configures WebSocket server
 * @param server - HTTP server to attach WebSocket to
 * @returns WebSocket server instance
 */
export function createWebSocketServer(server: any): WebSocketServer {
	const wss = new WebSocketServer({ server });

	logger.info('websocket_server_created');

	// Connection handler
	wss.on('connection', (ws: ExtendedWebSocket, req) => {
		ws.isAlive = true;
		
		logger.info(
			{ ip: req.socket.remoteAddress },
			'websocket_client_connected',
		);

		// Pong handler for heartbeat
		ws.on('pong', () => {
			ws.isAlive = true;
		});

		// Message handler
		ws.on('message', (data: Buffer) => {
			try {
				const message: WSMessage = JSON.parse(data.toString());
				handleWSMessage(ws, message);
			} catch (error) {
				logger.error({ error }, 'websocket_message_parse_error');
				sendError(ws, 'Invalid message format');
			}
		});

		// Close handler
		ws.on('close', () => {
			logger.info(
				{ userId: ws.userId },
				'websocket_client_disconnected',
			);
		});

		// Error handler
		ws.on('error', (error) => {
			logger.error({ error, userId: ws.userId }, 'websocket_error');
		});
	});

	// Heartbeat interval to detect dead connections
	const heartbeatInterval = setInterval(() => {
		wss.clients.forEach((ws: WebSocket) => {
			const extWs = ws as ExtendedWebSocket;
			if (!extWs.isAlive) {
				logger.warn({ userId: extWs.userId }, 'websocket_heartbeat_timeout');
				return extWs.terminate();
			}
			extWs.isAlive = false;
			extWs.ping();
		});
	}, HEARTBEAT_INTERVAL);

	// Clean up on server close
	wss.on('close', () => {
		clearInterval(heartbeatInterval);
		logger.info('websocket_server_closed');
	});

	return wss;
}

/**
 * Handles incoming WebSocket messages
 */
function handleWSMessage(ws: ExtendedWebSocket, message: WSMessage): void {
	logger.info(
		{ type: message.type, userId: ws.userId },
		'websocket_message_received',
	);

	switch (message.type) {
		case WSMessageType.PING:
			sendMessage(ws, { type: WSMessageType.PONG, timestamp: new Date() });
			break;
		case WSMessageType.RHYTHM_UPDATE:
			// Broadcast rhythm update to all clients (future: session-specific rooms)
			broadcastMessage(ws, message);
			break;
		case WSMessageType.SESSION_START:
		case WSMessageType.SESSION_PAUSE:
		case WSMessageType.SESSION_RESUME:
		case WSMessageType.SESSION_END:
			// Handle session state changes
			logger.info({ type: message.type, payload: message.payload }, 'session_state_change');
			break;
		default:
			logger.warn({ type: message.type }, 'websocket_unknown_message_type');
			sendError(ws, 'Unknown message type');
	}
}

/**
 * Sends a message to a specific WebSocket client
 */
function sendMessage(ws: ExtendedWebSocket, message: WSMessage): void {
	if (ws.readyState === WebSocket.OPEN) {
		ws.send(JSON.stringify(message));
	}
}

/**
 * Broadcasts a message to all connected clients
 */
function broadcastMessage(sender: ExtendedWebSocket, message: WSMessage): void {
	const wss = sender as any;
	if (wss.clients) {
		wss.clients.forEach((client: WebSocket) => {
			if (client !== sender && client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}
}

/**
 * Sends an error message to a client
 */
function sendError(ws: ExtendedWebSocket, errorMessage: string): void {
	sendMessage(ws, {
		type: WSMessageType.ERROR,
		payload: { error: errorMessage },
		timestamp: new Date(),
	});
}
