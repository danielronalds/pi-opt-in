import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { Notification, NotificationProvider } from "./notification-provider.ts";

const notificationScript = `
on run argv
	display notification (item 2 of argv) with title (item 1 of argv)
end run
`.trim();

export class MacosProvider implements NotificationProvider {
	constructor(private readonly pi: Pick<ExtensionAPI, "exec">) {}

	async sendNotification({ title, body }: Notification) {
		await this.pi.exec("/usr/bin/osascript", ["-e", notificationScript, title, body]);
	}
}
