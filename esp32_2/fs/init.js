load('api_mqtt.js');
load('api_gpio.js');
load('api_wifi.js');
load('api_timer.js');

let PIN_BTN1 = 14, PIN_BTN2 = 32, topic = 'group8';
GPIO.set_pull(PIN_BTN1, GPIO.PULL_UP);
GPIO.set_pull(PIN_BTN2, GPIO.PULL_UP);


GPIO.set_button_handler(PIN_BTN1, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 100, function() {
  let res = MQTT.pub('group8', JSON.stringify("Button 1"), 1);
  print('Published:', res ? 'yes' : 'no');
}, null);

GPIO.set_button_handler(PIN_BTN2, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 100, function() {
    let res = MQTT.pub('group8', JSON.stringify("Button 2"), 1);
    print('Published:', res ? 'yes' : 'no');
  }, null);


print("Connected to mqtt? ", MQTT.isConnected());
