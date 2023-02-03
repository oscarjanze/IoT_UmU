load('api_mqtt.js');
load('api_gpio.js');
load('api_wifi.js');
load('api_timer.js');

let PIN_BTN1 = 14, PIN_BTN2 = 32, topic = 'group8';
GPIO.set_pull(PIN_BTN1, GPIO.PULL_UP);
GPIO.set_pull(PIN_BTN2, GPIO.PULL_UP);

GPIO.set_button_handler(PIN_BTN1, GPIO.PULL_UP, GPIO.INT_EDGE_ANY, 100, 
	function(x) {
		if (!GPIO.read(x)){
			let res = MQTT.pub('group8', JSON.stringify("Button 1 on"), 1);
			print('Btn 1 on, Published:', res ? 'yes' : 'no');
		} else {
			let res = MQTT.pub('group8', JSON.stringify("Button 1 off"), 1);
			print('Btn 1 off, Published:', res ? 'yes' : 'no');
		}
	}, null);


GPIO.set_button_handler(PIN_BTN2, GPIO.PULL_UP, GPIO.INT_EDGE_ANY, 100, 
	function(x) {
		if (!GPIO.read(x)){
			let res = MQTT.pub('group8', JSON.stringify("Button 2 on"), 1);
			print('Btn 2 on, Published:', res ? 'yes' : 'no');
		} else {
			let res = MQTT.pub('group8', JSON.stringify("Button 2 off"), 1);
			print('Btn 2 off, Published:', res ? 'yes' : 'no');
		}
	}, null);

print("Connected to mqtt? ", MQTT.isConnected());
