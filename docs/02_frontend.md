# 02 Frontend

## Visitor view

The webpage is a full-screen, responsive desktop experience with a full-window gradient sky scene.

At startup, the visitor sees:
- A character input in the center of the screen.
- One Connect ESP32 button in the top-right corner.
- Brief instructions explaining that one physical press triggers red and two presses trigger the apple sequence.

After the ESP32 is connected, the Connect ESP32 button disappears. The character input remains centered and the visitor can enter exactly one character. All interaction then comes from the physical button and input dialog.

## Inputs and controls

The page accepts exactly one character. It does not restrict letters, numbers, symbols, or spaces; the final character is kept exactly as entered.
- Empty input is invalid.
- Multiple characters are invalid.
- The hardware animation does not start while the input is empty or invalid.

An invalid input state shows a reminder that one character must be entered.

## Main animation sequence

### One press
- The character input disappears during the animation.
- The sky scene changes for the red sequence.
- A red firework or explosion burst appears for 2 seconds.
- No sound is played.
- No character or apple is shown in this phase.

### Two presses
- The character input disappears during the animation.
- Blue light enters from the left side.
- Green light enters from the right side.
- The two colors travel toward the center over 3 seconds.
- At the center, they collide and form an explosion lasting 1 second.
- A realistic red apple appears with the entered character embossed on its center.
- The apple remains visible for 4 seconds.
- No sound is played.

## After the apple

When the 4-second apple hold finishes:
- The character is cleared.
- An input dialog appears.
- The dialog asks whether to keep the same character or change it.
- Choosing Keep same restores the previous character in the input.
- Choosing Enter a new character opens the input for a new one-character value.

## Page behavior

- Presses received while an animation is playing are queued; only the latest press is retained.
- Queued work starts immediately after the current animation finishes.
- Reloading the browser resets the sequence and character state.
- The design prioritizes desktop Chrome and Edge on Windows in landscape mode, while remaining responsive at other supported desktop sizes.
