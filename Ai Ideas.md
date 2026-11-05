# AI Ideas

## Original project overview

A Freenove ESP32-WROVER board has:
- RGB red connection on GPIO 13
- RGB green connection on GPIO 15
- RGB blue connection on GPIO 33
- Physical button connection on GPIO 14

The project asks the visitor to enter one character. One physical button press creates a red firework-style burst. Two quick physical button presses make blue enter from the left and green enter from the right, meet in the center, create an explosion, and reveal a realistic red apple containing the entered character.

## Hardware and communication decisions

- The physical button uses GPIO 14, GND, INPUT_PULLUP, and active-low behavior.
- The RGB common connection goes through a resistor toward the negative rail.
- The LED is common-cathode in the documented setup, but the actual component should be tested if behavior differs.
- The RGB channels use GPIO digital HIGH/LOW only, not PWM.
- Communication uses Chrome/Edge Web Serial over USB.
- The serial baud rate is 115200.
- Wi-Fi was considered but is no longer used.
- The ESP32's firmware language is C++.

## Press behavior

- One press produces a single red burst.
- Two presses within one second produce the blue/green explosion and apple.
- Additional presses reset or restart the sequence rather than adding another action type.
- Press counting may be implemented on either the ESP32 or browser; the simplest reliable method is preferred.
- Button bounce is handled by firmware debounce.
- The sequence resets on browser reload.

## Character behavior

- Exactly one character is required.
- No character restrictions are applied: letters, numbers, symbols, spaces, and emoji-like values are not excluded by the earlier requirement, although implementation should test grapheme behavior carefully.
- Lowercase and uppercase are kept exactly as entered.
- The character input disappears during animations.
- After the apple hold finishes, the character is cleared.
- A dialog asks whether the visitor wants to keep the same character or enter a new character.
- Keeping the same character restores it.

## Frontend decisions

- Desktop Chrome and Edge on Windows are primary targets.
- The layout is a full-screen responsive desktop gradient sky scene.
- The character input starts in the center.
- The Connect ESP32 button appears in the top-right corner before connection and disappears after connection.
- There are no other permanent controls.
- One-press animation lasts 2 seconds.
- Blue and green converge over 3 seconds.
- The center explosion lasts 1 second.
- The realistic red apple stays visible for 4 seconds.
- Sound effects are excluded.
- If a press arrives during an animation, the latest press is queued and starts immediately afterward.

## Backend decisions

- The laptop acts as the local HTTP server.
- The webpage is served at http://localhost:3000.
- A Node.js JavaScript server serves static files and can support optional API and logging code.
- Plain Web Serial communication does not require a server database.
- A local CSV file records activity at logs/event-log.csv.
- CSV columns are Timestamp, Character, Press count, Animation name, and Result.
- The logs folder is created automatically.
- Reloading removes temporary browser state.

## Error decisions

- Unsupported or blocked Web Serial shows instructions and stops animations.
- Serial loss stops animations and shows a reconnect message.
- Invalid or empty character data blocks the hardware event.
- If CSV logging fails, retry writing every few seconds while continuing animation.
- If the local server becomes unavailable, show a blocking error and require manual refresh.

## RGB behavior

- One press lights red for 2 seconds, then all channels turn off.
- Blue and green appear from their browser sides during the 3-second approach.
- The final center explosion is red for 0.6 seconds.
- All RGB channels turn off after the explosion.

## Buzzer behavior

- Passive piezo buzzer signal: GPIO 32.
- One press plays a short 900 Hz red-burst beep.
- Two presses play rising chirps at 350 ms, 1100 ms, and 2000 ms.
- The double-press explosion begins with a low 110 Hz boom tone at 3 seconds.
