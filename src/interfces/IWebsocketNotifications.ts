import { ISocketCloseError } from "./ISocketCloseError";
import { WebSocketWrapper } from "../server/webSocketWrapper";


export interface IWebsocketNotifications {
    onSocketOpened(socketWrapper: WebSocketWrapper);
    onSocketClosed(socketWrapper: WebSocketWrapper, error: ISocketCloseError);
    onSocketMessgae(socketWrapper: WebSocketWrapper, message: string);
    onSocketError(socketWrapper: WebSocketWrapper, error: string);
}
