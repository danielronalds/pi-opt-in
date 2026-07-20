export interface Notification {
	title: string;
	body: string;
	playSound: boolean;
}

export interface NotificationProvider {
	sendNotification(notification: Notification): Promise<void>;
}
