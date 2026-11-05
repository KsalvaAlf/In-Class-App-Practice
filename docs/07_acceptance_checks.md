# 07 Acceptance checks

## Startup checks

1. Open http://localhost:3000 successfully.
2. Confirm that Chrome or Edge on Windows shows the gradient sky and centered character input.
3. Confirm that the Connect ESP32 button appears in the top-right corner.
4. Confirm that unsupported-browser and connection-denial states provide clear messages.

## Serial connection checks

1. Connect the ESP32 by USB.
2. Click Connect ESP32.
3. Select the ESP32 serial port.
4. Confirm serial opens at 115200 baud.
5. Confirm the Connect button disappears after connection.
6. Unplug the USB cable and confirm a reconnect message appears.
7. Reconnect the same ESP32 and confirm the page resumes.

## Character input checks

1. Confirm no animation starts while the input is empty.
2. Enter one letter and confirm it remains in its exact entered case.
3. Enter one number and confirm it appears correctly.
4. Enter one symbol and confirm it appears correctly.
5. Enter two characters and confirm it is rejected.
6. Confirm spaces or extra characters cannot accidentally trigger a valid state.
7. Confirm the input is centered before the animation.
8. Confirm the input disappears during animation.

## One-press red check

1. Enter a valid character.
2. Press the physical button once.
3. Wait one second without pressing again.
4. Confirm a red firework burst lasts 2 seconds.
5. Confirm GPIO 13 turns red on the physical RGB LED for 2 seconds.
6. Confirm the physical LED is off afterward.
7. Confirm the character remains until the sequence decision or expiry rules finish.

## Two-press explosion check

1. Enter a valid character such as A.
2. Press the physical button twice within one second.
3. Confirm blue enters from the left.
4. Confirm green enters from the right.
5. Confirm both waves meet in the center after 3 seconds.
6. Confirm a visible center explosion lasts 1 second.
7. Confirm a realistic red apple appears.
8. Confirm the exact entered character is embossed in the apple.
9. Confirm the apple remains visible for 4 seconds.
10. Confirm the physical LED follows blue/green during the approach and red during the final 0.6-second explosion.
11. Confirm all physical RGB channels turn off afterward.

## After-apple check

1. Confirm the character is cleared after the 4-second apple hold.
2. Confirm the keep/change dialog appears.
3. Choose Keep same and confirm the previous character returns.
4. Run the sequence again.
5. Choose Enter a new character and confirm the input accepts exactly one replacement character.

## Press handling check

1. Start an animation.
2. Press the physical button during the animation.
3. Confirm the latest press is queued.
4. Confirm the queued action begins immediately after the current animation finishes.
5. Confirm extra presses do not create an unexpected third animation type.
6. Reload the page and confirm the sequence resets.

## Logging checks

1. Confirm logs/event-log.csv is created automatically.
2. Confirm rows contain Timestamp, Character, Press count, Animation name, and Result.
3. Confirm commas and quotes in a character value do not corrupt the CSV.
4. Lock or rename the CSV and confirm writes retry automatically.
5. Confirm animations continue while a CSV write warning is displayed.
6. Stop the Node.js server and confirm a blocking refresh-required error appears.
