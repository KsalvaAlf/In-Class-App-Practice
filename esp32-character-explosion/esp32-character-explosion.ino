#include <Arduino.h>

const uint8_t BUTTON_PIN = 14;
const uint8_t RED_PIN = 13;
const uint8_t GREEN_PIN = 15;
const uint8_t BLUE_PIN = 33;
const uint8_t BUZZER_PIN = 32;

const uint32_t DEBOUNCE_MS = 35;
const uint32_t DOUBLE_PRESS_WINDOW_MS = 1000;
const uint32_t RED_BURST_MS = 1600;
const uint32_t SIDE_APPROACH_MS = 2200;
const uint32_t FINAL_RED_MS = 700;

bool lastButtonReading = HIGH;
bool stableButtonState = HIGH;
uint32_t lastDebounceChangeMs = 0;
uint32_t firstPressMs = 0;
uint32_t actionStartMs = 0;
uint8_t pressCountInWindow = 0;
bool waitingForSecondPress = false;
bool actionRunning = false;
bool bluePhase = true;
bool redToneStarted = false;
bool sideToneOneStarted = false;
bool sideToneTwoStarted = false;
bool sideToneThreeStarted = false;
bool finalBoomStarted = false;

void allLedsOff() {
  digitalWrite(RED_PIN, LOW);
  digitalWrite(GREEN_PIN, LOW);
  digitalWrite(BLUE_PIN, LOW);
}

void redOn() {
  allLedsOff();
  digitalWrite(RED_PIN, HIGH);
}

void blueOn() {
  allLedsOff();
  digitalWrite(BLUE_PIN, HIGH);
}

void greenOn() {
  allLedsOff();
  digitalWrite(GREEN_PIN, HIGH);
}

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(RED_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(BLUE_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  allLedsOff();
  Serial.begin(115200);
}

void startSideExplosion() {
  actionRunning = true;
  actionStartMs = millis();
  bluePhase = true;
  sideToneOneStarted = false;
  sideToneTwoStarted = false;
  sideToneThreeStarted = false;
  finalBoomStarted = false;
  blueOn();
  Serial.println("SIDE_EXPLOSION");
}

void startRedBurst() {
  actionRunning = true;
  actionStartMs = millis();
  redToneStarted = false;
  redOn();
  Serial.println("RED_BURST");
}

void handleButton() {
  bool reading = digitalRead(BUTTON_PIN);
  uint32_t now = millis();

  if (reading != lastButtonReading) {
    lastButtonReading = reading;
    lastDebounceChangeMs = now;
  }

  if (now - lastDebounceChangeMs < DEBOUNCE_MS) return;
  if (reading == stableButtonState) return;

  stableButtonState = reading;
  if (stableButtonState != LOW) return;

  if (actionRunning) {
    waitingForSecondPress = false;
    pressCountInWindow = 0;
    return;
  }

  if (!waitingForSecondPress) {
    waitingForSecondPress = true;
    firstPressMs = now;
    pressCountInWindow = 1;
  } else if (now - firstPressMs <= DOUBLE_PRESS_WINDOW_MS) {
    pressCountInWindow = 2;
    waitingForSecondPress = false;
    startSideExplosion();
  } else {
    waitingForSecondPress = true;
    firstPressMs = now;
    pressCountInWindow = 1;
  }
}

void loop() {
  handleButton();
  uint32_t now = millis();

  if (waitingForSecondPress && pressCountInWindow == 1 &&
      now - firstPressMs >= DOUBLE_PRESS_WINDOW_MS) {
    waitingForSecondPress = false;
    startRedBurst();
  }

  if (actionRunning && pressCountInWindow == 1 && !redToneStarted) {
    tone(BUZZER_PIN, 800, 150);
    redToneStarted = true;
  }

  if (!actionRunning) return;

  if (pressCountInWindow == 2) {
    uint32_t elapsed = now - actionStartMs;
    if (elapsed >= 300 && !sideToneOneStarted) {
      tone(BUZZER_PIN, 400, 140);
      sideToneOneStarted = true;
    } else if (elapsed >= 900 && !sideToneTwoStarted) {
      tone(BUZZER_PIN, 650, 140);
      sideToneTwoStarted = true;
    } else if (elapsed >= 1600 && !sideToneThreeStarted) {
      tone(BUZZER_PIN, 900, 140);
      sideToneThreeStarted = true;
    } else if (elapsed >= SIDE_APPROACH_MS && !finalBoomStarted) {
      tone(BUZZER_PIN, 110, 350);
      finalBoomStarted = true;
    }
    if (elapsed < SIDE_APPROACH_MS) {
      if (elapsed >= SIDE_APPROACH_MS / 2 && bluePhase) {
        bluePhase = false;
        greenOn();
      }
    } else if (elapsed < SIDE_APPROACH_MS + FINAL_RED_MS) {
      if (!digitalRead(RED_PIN)) redOn();
    } else {
      allLedsOff();
      noTone(BUZZER_PIN);
      actionRunning = false;
      pressCountInWindow = 0;
    }
  } else if (now - actionStartMs >= RED_BURST_MS) {
    allLedsOff();
    noTone(BUZZER_PIN);
    actionRunning = false;
    pressCountInWindow = 0;
  }
}
