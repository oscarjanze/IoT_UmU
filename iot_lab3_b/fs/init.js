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



function fan_controller(speed){

    if (test_mode) {    
    PWM.set(PIN_PWM, fan_hz, fan_duty/100);
    print("");
    print("Fan_hz:", fan_hz, " | fan_duty:", fan_duty/100)
    } else {
        if (speed <= 20){
                PWM.set(PIN_PWM, 20000, 0.5);
        } else if (20 < speed && speed <= 40){

        } else if (40 < speed && speed <= 60){
            
        } else if (60 < speed && speed <= 80){
            
        } else {
            PWM.set(PIN_PWM, 25000, 0);
        }
    }
    
}

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
let verifyConnectionTimer = Timer.set(1000, Timer.REPEAT, verifyConnection, null);


function mqttSubscribe() {

    MQTT.sub('group8/fan', function(conn, topic, msg) {

        // let decoded_msg = JSON.parse(msg);

        // //Även med init bugg kan den parsa informationen
        // let command = decoded_msg.temp;
        // let device = decoded_msg.device;

        let decoded_msg = JSON.parse(msg);
        print("--duty:", msg, "(parsed:", decoded_msg, ")");
        speed = decoded_msg;
        fan_controller(speed);
        



        /* if(device === "esp32_A"){
            //Gör en fin övergång från 0 - 100 %

            print("msg! ", command);
            //fan_controller(command);
            if(command >= 22 && command <= 24) {
                //50% Duty-cycle
                fan_controller(0.5);
            }
            else if(command > 25) {
                //90% Duty-cycle 
                fan_controller(0.9);
            }
            else {
                //20% Duty-cycle
                fan_controller(0.2);
            }   
        } */
        

    }, null);
}


function mqttSubDuty() {

    MQTT.sub('group8/fan/duty', function(conn, topic, msg) {

        let decoded_msg = JSON.parse(msg);
        fan_duty = decoded_msg;
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

    

//Timer.set(1000, Timer.REPEAT, fan_controller, null);