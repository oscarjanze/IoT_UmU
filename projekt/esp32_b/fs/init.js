// ESP32 - B

load('api_timer.js');
load('api_gpio.js');
load('api_i2c.js');
load('api_adc.js');
load('api_pwm.js');
load('api_sys.js');
load('api_wifi.js');
load('api_mqtt.js');


let PIN_BTN1 = 21;
let PIN_PWM = 17;
let PIN_LEDR = 33; // red LED #1
let PIN_ADC1 = 36;
let PIN_ADC2 = 39;




print("ADC enabled! PIN_ADC1:", ADC.enable(PIN_ADC1));
print("ADC enabled! PIN_ADC2:", ADC.enable(PIN_ADC2));


let i = 0;
let fan_hz = 25000;
let fan_duty = 100;
let test_mode = false;
let light_array = [];
let sound_array = [];
let flicker_counter = 0;
let diff = 0;
//let store_val = 0;
GPIO.setup_output(PIN_LEDR, 0);




function verifyConnection(){
    print("-- Checking connection to MQTT:");
    if (MQTT.isConnected()){
        print("---- Connection to MQTT found.");
        mqttSubscribe();
        Timer.del(verifyConnectionTimer);
    } else {
        print("---- Connection to MQTT not found. Retrying.")
    }
}



//  MQTT
//  group8/esp32B/lightsensor
//  group8/esp32B/movement
//  group8/esp32B/mikrofon


//  ADC * 2
//  read pin 1

function ADC_function_1() {
    ADC.enable(PIN_ADC1);
    let adc_value_1 = ADC.read(PIN_ADC1);
    light_array[i++] = adc_value_1;
    !ADC.enable(PIN_ADC1);
}

function ADC_function_2() {
    
    //let adc_value_2 = ADC.read(PIN_ADC2);
    //sound_array[i++] = adc_value_2;
}


//function Motion_detection() {}

function check_flicker() {
    for (let i = 0; i < light_array.length - 1; i++) {
        diff = light_array[i] - light_array[i+1];
        if(light_array.length > 60){
            if (30 < diff || -30 > diff) {
                flicker_counter++;
                print("Counted a flick!");
            }
        }
    }
    if (10 <= flicker_counter) {
        print("Shit's going hard AF rn! Lock up all the epileptic kids!");
        print("Flickers counted: ", flicker_counter);
        MQTT.pub('/door/light', "Lights are flickering in TA406", 0, 0);
    }
    diff = 0;
    flicker_counter = 0;
}

function print_array() {
    
    print("Here!");
    //print('Light array:', + light_array);
    //for (let i = 0; i < light_array.length; i++) {
    //    //print("Val:", light_array[i]);
    //}
    print("Lenght of light_array:", light_array.length);
    print("Lenght of sound_array:", sound_array.length);
    check_flicker();
    light_array = [];
    sound_array = [];
    i = 0;
}


function mqttSubscribe() {

    MQTT.sub('group8/', function(conn, topic, msg) {

    }, null);
}
//
//
//function mqttSubDuty() {
//
//    MQTT.sub('group8/fan/duty', function(conn, topic, msg) {
//
//        let decoded_msg = JSON.parse(msg);
//        fan_duty = decoded_msg / 100;
//        print("--duty:", msg, "(fan_duty:", fan_duty, ")");
//        fan_controller(0);
//
//    }, null);
//}
//
//function mqttSubHz() {
//
//    MQTT.sub('group8/fan/hz', function(conn, topic, msg) {
//
//        let decoded_msg = JSON.parse(msg);
//        fan_hz = decoded_msg > 79999 ? 79999 : decoded_msg;
//        print("--hz:", msg, "(fan_hz:", fan_hz, ")");
//        fan_controller(0);
//        
//    }, null);
//}


let verifyConnectionTimer = Timer.set(1000, Timer.REPEAT, verifyConnection, null);
Timer.set(10, Timer.REPEAT, ADC_function_1, null);
Timer.set(20, Timer.REPEAT, ADC_function_2, null);
Timer.set(1000, Timer.REPEAT, print_array, null);