# 06 Tech spec

## Required technologies

Frontend:
- HTML
- CSS
- JavaScript
- Web Serial API

Backend:
- Node.js JavaScript server
- CSV file storage

Hardware firmware:
- C++ in the ESP32 development environment

The project does not require Java, Java server code, Wi-Fi communication, Bluetooth, or a cloud service.

## Hosting

- The local webpage is served at http://localhost:3000.
- Chrome or Edge on Windows is the primary supported browser.
- The laptop is the local server.
- The ESP32 remains connected by USB for Web Serial.

## Hardware connections

- Button signal: GPIO 14
- Red channel: GPIO 13
- Green channel: GPIO 15
- Blue channel: GPIO 33
- Button electrical mode: INPUT_PULLUP and active low
- RGB mode: common cathode based on the long/common LED leg being connected through a resistor toward the negative rail

The RGB LED uses digital HIGH/LOW GPIO output. The page must not assume PWM brightness. One color channel may be active at a time unless the visual sequence specifically requires blue and green together.

## Button firmware rules

- Check the button with the internal pull-up.
- Debounce physical transitions with a short firmware delay or equivalent state machine.
- Count one press after the button is released and stable.
- Use a one-second window for grouping two press actions.
- Send a clear serial action message for one press or two presses.
- Use 115200 baud in both ESP32 and browser serial configuration.
- Ignore additional repeated events that belong to the same physical sequence rather than creating a third animation category.

## RGB firmware rules

- One press: illuminate red for 2 seconds, then turn off all channels.
- Two-press sequence: illuminate blue from the browser event start for its phase, green from the browser event start for its phase, then illuminate red for 0.6 seconds, and turn all channels off.
- Use GPIO 13, 15, and 33 exactly as documented.
- Verify the actual RGB wiring before running the sequence if the common connection behaves opposite to the expected common-cathode design.

## Serial protocol rules

- Communication is line-based.
- Each complete event ends with a newline.
- Messages must be ASCII-friendly and simple for browser parsing.
- Recommended implementation messages:
  - RED_BURST for one press
  - SIDE_EXPLOSION for two presses
- Unexpected messages are ignored and optionally logged.

## CSV rules

- File: logs/event-log.csv in the project folder.
- Create the logs folder automatically.
- Columns:
  - Timestamp
  - Character
  - Press count
  - Animation name
  - Result
- Append one row when an action starts or completes if the builder defines separate action and completion results consistently.
- Escape commas, quotes, and newline characters in character values.

## Animation timing

- Red burst: 2 seconds.
- Blue/green approach: 3 seconds.
- Center explosion: 1 second.
- Apple hold: 4 seconds.
- No sound.
- Physical RGB red duration: 2 seconds.
- Physical RGB final red explosion: 0.6 seconds before turnoff.

## Browser accessibility and layout

- Full-screen gradient sky.
- Desktop landscape as the first layout priority.
- Responsive sizing for different desktop window sizes.
- Character input centered.
- Connect button top-right only until serial connection succeeds.
- Character input removed during animations.
- Button presses remain hardware-only; no general mouse simulation control is included.
