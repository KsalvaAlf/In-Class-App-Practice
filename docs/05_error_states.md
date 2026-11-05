# 05 Error states

## Browser or serial support

Chrome or Edge on Windows is required for Web Serial.

If Web Serial is unsupported, blocked, or unavailable:
- Show a clear message that Chrome or Edge desktop is required.
- Explain that the page should run through http://localhost:3000.
- Explain that the visitor must allow the ESP32 USB connection.
- Do not start hardware animations.

## Connect button

The page may show a connection warning if:
- No USB port is selected.
- USB permission is denied.
- The selected device is not the ESP32.
- The ESP32 firmware is not sending the expected events.
- The selected baud rate does not match 115200.

The Connect ESP32 button remains available until a valid connection is restored.

## Serial disconnection

When the USB connection is lost:
- Stop new animations.
- Show a reconnect message.
- Preserve the entered character where possible.
- Return to normal operation only after serial reconnects.

## Empty or invalid character

When the character is:
- Empty.
- Longer than one character.
- Replaced by multiple Unicode code points that do not represent one visible character.

The page shows a reminder asking for exactly one character and ignores the button action.

## Button noise and repeated presses

The ESP32 debounce routine suppresses accidental repeated electrical transitions. Presses within one second are grouped as one double action. Additional presses restart or reset the sequence rather than becoming new animation types.

## Animation already playing

During a current animation:
- Button presses are ignored visually unless there is room in the queue.
- The latest press is queued for immediate execution after the current animation.
- Only one queued event is retained.

## Local server unavailable

If http://localhost:3000 or the logging API is unavailable:
- The page shows a blocking error.
- The visitor must refresh the page manually.
- Hardware animations do not continue until the page is loaded successfully again.

## CSV write failure

If logs/event-log.csv cannot be opened or updated:
- Keep the webpage and hardware animations running.
- Retry writing automatically every few seconds.
- Show a small warning or status message.
- Do not block or reset the current animation.

## CSV log locking

If Excel or another program has locked the CSV file:
- Retry writing later.
- Preserve pending rows in memory until writing succeeds.
- Do not repeatedly restart the server or lose the page state.
