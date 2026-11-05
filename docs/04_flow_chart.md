# 04 Flow chart

## Startup

1. Visitor opens http://localhost:3000 in Chrome or Edge on Windows.
2. The page loads the full-screen gradient sky, character input, and instructions.
3. The visitor clicks Connect ESP32 in the top-right corner.
4. The browser requests a USB serial port.
5. If the visitor grants access, the ESP32 connection opens at 115200 baud.
6. The Connect ESP32 button disappears.

## Character validation

1. The visitor types one character into the centered input.
2. The page checks whether the input contains exactly one character.
3. If valid, the page waits for a hardware button event.
4. If invalid, it shows a one-character reminder and ignores animation requests.

## Physical button handling

1. The ESP32 detects the button changing from released to pressed.
2. A short software debounce period rejects electrical noise.
3. The press is counted.
4. If this is the first press in an expected sequence, the ESP32 starts a one-second double-press window.
5. If no second press arrives within one second, the press is sent as a single press.
6. If a second press arrives within one second, the press sequence is sent as a double press.
7. Further presses reset or restart the sequence rather than creating a new sequence type.
8. The resulting action is sent to the webpage over USB serial.

## Single press

1. Check that the current character is valid.
2. Check whether an animation is already playing.
3. If an animation is playing, queue the latest press and stop processing further press details.
4. If idle, submit a single-press log result and start the red sequence.
5. Centered input disappears during animation.
6. Show the red burst for 2 seconds.
7. Keep the physical RGB LED red for 2 seconds, then turn it off.
8. Restore the normal screen and character input.

## Double press

1. Check that the current character is valid.
2. Check whether an animation is playing.
3. If an animation is playing, queue the latest press.
4. If idle, submit a double-press log result.
5. Hide the character input.
6. Show blue entering from the left for 3 seconds.
7. Show green entering from the right for 3 seconds.
8. Turn the blue and green RGB channels on while their color waves move toward the center.
9. When they meet, show the center collision and explosion for 1 second.
10. Turn the physical RGB output red for the final 0.6-second explosion phase.
11. Show the realistic red apple and embossed character for 4 seconds.
12. Turn the physical RGB output off.
13. Clear the character input.
14. Ask whether to keep the character or enter a new character.

## Keep same decision

1. If the visitor chooses Keep same, restore the previous character in the input.
2. Return to waiting for physical button presses.

## Change decision

1. If the visitor chooses Enter a new character, clear the input and place focus in it.
2. Wait until the visitor has entered exactly one valid character.
3. Return to waiting for physical button presses.

## Disconnect or failure

1. If USB serial disconnects, stop new animations.
2. Show a reconnect message.
3. Reuse the Connect ESP32 button when the visitor chooses to reconnect.
4. Do not resume animations until the serial connection is restored.
