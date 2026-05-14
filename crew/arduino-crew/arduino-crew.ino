// Behind Wings — six switches on digital pins 2..7.
// Wire each switch from its pin to GND. INPUT_PULLUP handles the rest.
// (Web app roster uses numeric `id` in crew.json; values 2..7 match these pins.)
//
// Serial protocol (115200 baud):
//   READY                    (once on boot)
//   STATE:<pin>:<ON|OFF>     (sent on boot and on every debounced change)

const uint8_t SWITCH_PINS[6] = {2, 3, 4, 5, 6, 7};
const uint8_t NUM_SWITCHES = 6;
const unsigned long DEBOUNCE_MS = 20;

int lastReading[NUM_SWITCHES];
int stableState[NUM_SWITCHES];
unsigned long lastChangeMs[NUM_SWITCHES];

void emitState(uint8_t pin, int state) {
  // state is the raw pin reading (HIGH = OFF, LOW = ON).
  Serial.print("STATE:");
  Serial.print(pin);
  Serial.println(state == LOW ? ":ON" : ":OFF");
}

void setup() {
  Serial.begin(115200);
  while (!Serial) delay(10);

  for (uint8_t i = 0; i < NUM_SWITCHES; i++) {
    pinMode(SWITCH_PINS[i], INPUT_PULLUP);
    stableState[i] = digitalRead(SWITCH_PINS[i]);
    lastReading[i] = stableState[i];
    lastChangeMs[i] = millis();
  }

  Serial.println("READY");
  for (uint8_t i = 0; i < NUM_SWITCHES; i++) {
    emitState(SWITCH_PINS[i], stableState[i]);
  }
}

void loop() {
  for (uint8_t i = 0; i < NUM_SWITCHES; i++) {
    int reading = digitalRead(SWITCH_PINS[i]);

    if (reading != lastReading[i]) {
      lastReading[i] = reading;
      lastChangeMs[i] = millis();
    }

    if ((millis() - lastChangeMs[i]) > DEBOUNCE_MS && reading != stableState[i]) {
      stableState[i] = reading;
      emitState(SWITCH_PINS[i], stableState[i]);
    }
  }
}
