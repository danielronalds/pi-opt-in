import { basename } from "node:path";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { MacosProvider } from "./macos-provider.ts";

const NOTIFICATION_BODY_MAX_LENGTH = 200;
const NOTIFICATION_STATE_ENTRY = "turn-notification-state";

interface NotificationState {
	enabled: boolean;
}

function getNotificationProvider(pi: ExtensionAPI) {
	switch (process.platform) {
		case "darwin":
			return new MacosProvider(pi);
		default:
			return undefined;
	}
}

export default function (pi: ExtensionAPI) {
	const notificationProvider = getNotificationProvider(pi);
	let latestMessageText = "";
	let notificationsEnabled = false;

	function updateStatus(ctx: ExtensionContext) {
		ctx.ui.setStatus("turn-notifications", notificationsEnabled ? "notifications: on" : undefined);
	}

	function restoreState(ctx: ExtensionContext) {
		notificationsEnabled = false;

		for (const entry of ctx.sessionManager.getBranch()) {
			if (entry.type !== "custom" || entry.customType !== NOTIFICATION_STATE_ENTRY) {
				continue;
			}

			const state = entry.data as NotificationState | undefined;
			if (typeof state?.enabled === "boolean") {
				notificationsEnabled = state.enabled;
			}
		}

		updateStatus(ctx);
	}

	pi.registerCommand("opt-in", {
		description: "Enable or disable desktop notifications for this session",
		handler: async (_args, ctx) => {
			if (!ctx.hasUI) {
				return;
			}

			const selection = await ctx.ui.select(
				`Desktop notifications are currently ${notificationsEnabled ? "on" : "off"}`,
				["On", "Off"],
			);
			if (!selection) {
				return;
			}

			const enabled = selection === "On";
			if (enabled !== notificationsEnabled) {
				notificationsEnabled = enabled;
				pi.appendEntry<NotificationState>(NOTIFICATION_STATE_ENTRY, { enabled });
			}

			updateStatus(ctx);
			ctx.ui.notify(`Desktop notifications ${enabled ? "enabled" : "disabled"}`, "info");
		},
	});

	pi.on("session_start", (_event, ctx) => {
		restoreState(ctx);
	});

	pi.on("session_tree", (_event, ctx) => {
		restoreState(ctx);
	});

	pi.on("agent_start", () => {
		latestMessageText = "";
	});

	pi.on("turn_end", (event) => {
		if (event.message.role !== "assistant") {
			return;
		}

		const messageText = event.message.content
			.filter((block) => block.type === "text")
			.map((block) => block.text)
			.join("\n")
			.trim();

		if (messageText) {
			latestMessageText = messageText;
		}
	});

	pi.on("agent_settled", async (_event, ctx) => {
		if (!notificationsEnabled || !latestMessageText) {
			return;
		}

		if (!notificationProvider) {
			console.error(`Desktop notifications are not supported on ${process.platform}`);
			return;
		}

		const directoryName = basename(ctx.cwd) || ctx.cwd;
		const title = `"${directoryName}"`;
		const messageCharacters = Array.from(latestMessageText.replace(/\s+/g, " ").trim());
		const body =
			messageCharacters.length > NOTIFICATION_BODY_MAX_LENGTH
				? `${messageCharacters.slice(0, NOTIFICATION_BODY_MAX_LENGTH - 3).join("").trimEnd()}...`
				: messageCharacters.join("");
		latestMessageText = "";

		await notificationProvider.sendNotification({ title, body });
	});
}
