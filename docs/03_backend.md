# 03 Backend

## System parts

The final design uses four separate parts:
1. A laptop-hosted Node.js JavaScript server.
2. A browser webpage served at http://localhost:3000.
3. An ESP32-WROVER running C++ firmware.
4. The physical button and RGB LED attached to the ESP32.

The laptop server does not control the button directly. It serves the webpage and receives logging requests from the browser.

## ESP32 button role

The button is connected to:
- GPIO 14
- GND
- INPUT_PULLUP behavior in the ESP32 firmware
- Active-low pressed state

The ESP32 counts button releases using software debouncing. Presses close together are treated as a double press. The ESP32 sends press action messages over USB serial at 115200 baud. No data moves over Wi-Fi for this version.

Either the ESP32 or browser may perform press grouping. The implementation should use the simpler and more reliable method available, provided:
- One press triggers RED_BURST.
- Two presses trigger SIDE_EXPLOSION.
- Additional presses reset the sequence rather than creating a third animation type.

## Browser and ESP32 communication

The browser uses the Chrome/Edge Web Serial API over the ESP32's USB cable.
- The visitor grants the connection through the Connect ESP32 button.
- The ESP32 sends newline-delimited plain text or newline-delimited numeric messages.
- The exact message format is defined during implementation and documented in the serial protocol.

## Laptop server role

The Node.js server:
- Serves the HTML, CSS, and JavaScript from localhost.
- Provides the browser with log-writing endpoints if it hosts the application API.
- Creates and appends to logs/event-log.csv.
- Retries a failed CSV write automatically every few seconds.

The server does not need to know about the physical button when the browser communicates with the ESP32 directly through Web Serial.

## State and memory

The browser temporarily remembers:
- The entered character.
- Whether the serial connection is open.
- The active animation.
- Queued press information.
- The animation status.

Reloading the browser resets these values.

The laptop server permanently records:
- Timestamp
- Entered character
- Press count
- Animation name
- Result

The log is written to:
- logs/event-log.csv inside the project folder.
- The logs folder is created automatically when it does not exist.
