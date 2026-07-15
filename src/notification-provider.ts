export interface Notification {
	title: string;
	body: string;
}

export interface NotificationProvider {
	sendNotification(notification: Notification): Promise<void>;
}
