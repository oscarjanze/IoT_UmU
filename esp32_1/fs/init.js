load('api_mqtt.js');
load('api_gpio.js');
load('api_wifi.js');
load('api_timer.js');
// load('api_adc.js');
// load('api_i2c.js');
// load('api_math.js');
// load('api_pwm.js');
// load('api_spi.js');
// load('api_sys.js');

let PIN_LEDR = 15;      // red LED
let PIN_LEDY = 32;      // yellow LED
let PIN_LEDG = 14;      // green LED
let PIN_LEDB = 33;      // blue LED
let topic = 'topic';
let loop_counter = 1;
let first_loop = true;
let first_connection = true;
let btn1_state = 0;
let btn2_state = 0;



GPIO.setup_output(PIN_LEDR, 1);
GPIO.setup_output(PIN_LEDG, 1);
GPIO.setup_output(PIN_LEDY, 1);
GPIO.setup_output(PIN_LEDB, 1);

// ! Functions & Events ! //

function clearLog(){
	for (let i = 0; i < 30; i++) {
		print("");
	}
}

function updateLEDs(){
	if (btn1_state === 0 && btn2_state === 0){
		GPIO.write(PIN_LEDR, 0);
		GPIO.write(PIN_LEDY, 0);
		GPIO.write(PIN_LEDG, 0);
	}

	if (btn1_state === 1 && btn2_state === 0){
		GPIO.write(PIN_LEDR, 1);
		GPIO.write(PIN_LEDY, 0);
		GPIO.write(PIN_LEDG, 0);
	}

	if (btn1_state === 0 && btn2_state === 1){
		GPIO.write(PIN_LEDR, 1);
		GPIO.write(PIN_LEDY, 1);
		GPIO.write(PIN_LEDG, 0);

	}

	if (btn1_state === 1 && btn2_state === 1){
		GPIO.write(PIN_LEDR, 1);
		GPIO.write(PIN_LEDY, 1);
		GPIO.write(PIN_LEDG, 1);

	}

}

MQTT.sub('group8', function(conn, topic, msg) {
	print('Topic:', topic, ', Message:', msg);
	
	// let command = JSON.parse(msg);
	// btn1_state = command.btn1;
	// btn2_state = command.btn2;
	
	if (msg === '"Button 1 on"'){
		btn1_state = 1;
		print("Button 1 on");

	} else if (msg === '"Button 1 off"'){
		btn1_state = 0;
		print("Button 1 off");

	} else if (msg === '"Button 2 on"'){
		btn2_state = 1;
		print("Button 2 on");

	} else if (msg === '"Button 2 off"'){
		btn2_state = 0;
		print("Button 2 off");

	} else {
		print("Unknown command");
	}



	//{ a: 1, b: 2 }), 1)

}, null);


// MQTT.sub(topic, handler)
// * Subscribe to a topic, and call given handler function when message arrives. A handler receives 4 parameters: MQTT connection, topic name, message, and userdata. Return value: none.
// MQTT.sub('my/topic/#', function(conn, topic, msg) {
//   print('Topic:', topic, 'message:', msg);
// }, null);



// ! "Main" ! //
clearLog();

function min_timer_callback(){
	// Rensa lite i loggen för läsbarhet
	if (first_loop){
		clearLog();
		first_loop = false;
	}

	let mqtt_status = MQTT.isConnected();
	let loop_str = 'Loop #' + JSON.stringify(loop_counter++);


  

  	if (mqtt_status){
		if (first_connection){
			let msg_send = "Esp32_1 (LEDs) is connected. (" + loop_str + ")";
			print(msg_send);
			// let response = MQTT.pub('group8', JSON.stringify({btn1: 1, btn2: 0}), 1);

			GPIO.toggle(PIN_LEDR);
			GPIO.toggle(PIN_LEDY);
			GPIO.toggle(PIN_LEDG);
			GPIO.toggle(PIN_LEDB);
			first_connection = false;
		}
		
		updateLEDs();

  	} else {
		print(loop_str);
		print("MQTT connected?", mqtt_status);

	}

}
Timer.set(1000, Timer.REPEAT, min_timer_callback, null);

