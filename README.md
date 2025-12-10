# Privacy Shield

Chrome extension that blocks common tracking methods used by coding assessment platforms.

## Features

- **Keyboard Privacy**: Hides all Cmd/Ctrl/Alt key combinations and modifier key presses
- **Focus Tracking**: Blocks detection of tab switches, window blur, and visibility changes
- **Always Active**: Page always appears focused and visible
- **Mouse Throttling**: Reduces mouse movement tracking resolution
- **Beacon Blocking**: Blocks third-party analytics beacons

## Installation

1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select this folder

## Usage

Once installed, the extension runs automatically on all pages. No configuration needed.

## How It Works

- Overrides browser APIs (`document.hidden`, `visibilityState`, `hasFocus`)
- Intercepts event listeners for focus/visibility/keyboard events
- Modifies event properties to hide modifier keys
- Blocks event propagation for tracking attempts

## Disclaimer

For educational purposes. Use responsibly and in accordance with platform terms of service.
