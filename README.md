# Pi Turn Notifications

A [Pi](https://github.com/earendil-works/pi-mono) extension that sends a native macOS notification when Pi has finished responding and is waiting for input.

Notifications are disabled by default and can be enabled independently for each Pi session.

## Features

- Native macOS notifications using the built-in `osascript` command
- Notifications only after Pi has fully settled, not after individual tool calls
- Notification title containing the current directory name
- Notification body containing the first 200 characters of Pi's response
- Per-session notification preference that survives reloads and resumed sessions
- Footer status while notifications are enabled

## Requirements

- macOS
- Pi 0.80.6 or later

## Install

Copy and run:

```bash
pi install git:github.com/danielronalds/pi-turn-notifications
```

Restart Pi or run `/reload` in an existing Pi session after installation.

## Usage

Run:

```text
/notify
```

Select **On** or **Off** in the menu. New sessions start with notifications disabled. Your choice is retained when reloading or resuming the same session.

macOS may ask for permission to send notifications the first time the extension runs.

## Licence

[MIT](LICENSE)
