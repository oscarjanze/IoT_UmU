// ESP32 - B

load('api_timer.js');
load('api_gpio.js');
load('api_i2c.js');
load('api_pwm.js');
load('api_sys.js');
load('api_wifi.js');
load('api_mqtt.js');

let PIN_BTN1 = 21;
let PIN_PWM = 17;
let PIN_LEDR = 33; // red LED #1

let fan_hz = 25000;
let fan_duty = 100;
let test_mode = false;
//let store_val = 0;
GPIO.setup_output(PIN_LEDR, 0);


function verifyConnection(){
    print("-- Checking connection to MQTT:")
    if (MQTT.isConnected()){
        print("---- Connection to MQTT found.")
        mqttSubscribe();
        mqttSubDuty();
        mqttSubHz();
        Timer.del(verifyConnectionTimer);
    } else {
        print("---- Connection to MQTT not found. Retrying.")
    }
}



//  MQTT
//  group8/esp32B/lightsensor
//  group8/esp32B/movement
//  group8/esp32B/mikrofon


// ADC * 2
// read pin 1

function mqttSubscribe() {

    MQTT.sub('group8/', function(conn, topic, msg) {

    }, null);
}


function mqttSubDuty() {

    MQTT.sub('group8/fan/duty', function(conn, topic, msg) {

        let decoded_msg = JSON.parse(msg);
        fan_duty = decoded_msg / 100;
        print("--duty:", msg, "(fan_duty:", fan_duty, ")");
        fan_controller(0);

    }, null);
}

function mqttSubHz() {

    MQTT.sub('group8/fan/hz', function(conn, topic, msg) {

        let decoded_msg = JSON.parse(msg);
        fan_hz = decoded_msg > 79999 ? 79999 : decoded_msg;
        print("--hz:", msg, "(fan_hz:", fan_hz, ")");
        fan_controller(0);
        
    }, null);
}





GPIO.set_button_handler(PIN_BTN1, GPIO.PULL_UP, GPIO.INT_EDGE_ANY, 100, 
	function(x) {
		if (!GPIO.read(x)){

            print('-- Btn pressed');
            if (test_mode) {
                test_mode = false;
                print('-- Test Mode: Disabled');
                GPIO.write(PIN_LEDR, 0);

            } else {
                test_mode = true;
                print('-- Test Mode: Enabled');
                GPIO.write(PIN_LEDR, 1);

            }


		} 
	}, null);

    


let verifyConnectionTimer = Timer.set(1000, Timer.REPEAT, verifyConnection, null);
//Timer.set(1000, Timer.REPEAT, fan_controller, null);