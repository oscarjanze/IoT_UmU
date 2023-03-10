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
let PIN_MIC_GATE = 21;
let PIN_MOTION = 16;


//GPIO.set_mode(PIN_MOTION, GPIO.PULL);
GPIO.setup_input(PIN_MOTION, GPIO.PULL_UP);

print("ADC enabled! PIN_ADC1:", ADC.enable(PIN_ADC1));
print("ADC enabled! PIN_ADC2:", ADC.enable(PIN_ADC2));


let count_increment_1 = 0;
let count_increment_2 = 0;
let light_array = [];
let sound_array = [];
let flicker_counter = 0;
let diff = 0;
//let store_val = 0;
GPIO.set_mode(PIN_MIC_GATE, GPIO.MODE_INPUT);
GPIO.setup_output(PIN_LEDR, 0);

//              MÅL             //
//              MQTT            //
//  group8/esp32B/lightsensor   //
//  group8/esp32B/movement      //
//  group8/esp32B/mikrofon      //
//  ADC * 2                     //
//  read pin 1                  //
//  Events?




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

function ADC_function_1() {
    ADC.enable(PIN_ADC1);
    let adc_value_1 = ADC.read(PIN_ADC1);
    light_array[count_increment_1++] = adc_value_1;
    !ADC.enable(PIN_ADC1);
}


function ADC_function_2() {
    ADC.enable(PIN_ADC2);
    let adc_value_2 = ADC.read(PIN_ADC2);
    sound_array[count_increment_2++] = adc_value_2;
    !ADC.enable(PIN_ADC2);
}

function check_flicker() {
    for (let i = 1; i < light_array.length-1; i++) {
        //print("Whats this?: ",light_array[i], light_array[i-1]);
        diff = light_array[i] - light_array[i-1];

        //print("diff:",diff);
        if(light_array.length > 60){
            if (50 < diff || -50 > diff) {
                flicker_counter++;
                //print("Counted a flick!");
            }
        }
    }
    if (10 <= flicker_counter) {
        print("Shit's going hard AF rn! Lock up all the epileptic kids!");
        print("Flickers counted: ", flicker_counter);
        MQTT.pub('group8/esp32B/lightsensor/alarm', "Lights are flickering in TA406", 0, 0);
    }
    diff = 0;
    flicker_counter = 0;
}
function print_array() {
    
    //print("Here!");
    print("Lenght of light_array:", light_array.length);
    print("Lenght of sound_array:", sound_array.length);
    
    let sound_text = JSON.stringify({text: "EVERYBODY STAY CALM", array_s: sound_array});
    let light_text = JSON.stringify({text: "DISKOTEKA", array_l: light_array});

    MQTT.pub('group8/esp32B/lightsensor', light_text,0,0);
    MQTT.pub('group8/esp32B/mikrofon', sound_text,0,0);

    check_flicker();
    light_array = [];
    sound_array = [];
    count_increment_1 = 0;
    count_increment_2 = 0;

}


//function mqttSubscribe() {MQTT.sub('group8/', function(conn, topic, msg) {}, null);}

GPIO.set_int_handler(PIN_MOTION, GPIO.INT_EDGE_NEG, function(pin) {
    MQTT.pub('group8/esp32B/movement', "Motherfuckers are moving in TA406 ! Drink Coffee!", 0, 0);
}, null);

GPIO.enable_int(PIN_MOTION);

//let verifyConnectionTimer = Timer.set(1000, Timer.REPEAT, verifyConnection, null);
Timer.set(10, Timer.REPEAT, ADC_function_1, null);
Timer.set(20, Timer.REPEAT, ADC_function_2, null);
Timer.set(1000, Timer.REPEAT, print_array, null);



[{"id":"1dcee7c93ef6b81e","type":"ui_template","z":"44908087.da8e9","group":"93fb734b1b23203e","name":"StaticImageCam2Poort","order":3,"width":0,"height":0,"format":"<body>\n\n<p>\n<a href=\"/grabcam2.jpg\" target=\"_blank\">\n<img border=\"0\" alt=\"CamVoorGrab\" src=\"/grabcam2.jpg\" width=\"1000\"  height=\"800\">\n</a>\n</p>","storeOutMessages":true,"fwdInMessages":true,"resendOnRefresh":false,"templateScope":"local","className":"","x":1010,"y":700,"wires":[[]]},{"id":"93fb734b1b23203e","type":"ui_group","name":"Cam 2 Poort Grab","tab":"5afa5e126e0accce","order":1,"disp":true,"width":"19","collapse":false},{"id":"5afa5e126e0accce","type":"ui_tab","name":"Cam 2 Grab","icon":"icofont-camera-alt","order":34,"disabled":false,"hidden":false}]