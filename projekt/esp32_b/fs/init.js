// ESP32 - B
load('api_timer.js');
load('api_gpio.js');
load('api_i2c.js');
load('api_pwm.js');
load('api_wifi.js');
load('api_mqtt.js');
load('api_math.js');
load('api_adc.js');

let PIN_BTN1 = 21;
let PIN_PWM = 17;
let PIN_LEDR = 33; // red LED #1
let PIN_ADC_LIGHT = 36;
let PIN_ADC2 = 39;
let PIN_MIC_GATE = 21;
let PIN_MOTION = 16;

GPIO.setup_input(PIN_MOTION, GPIO.PULL_UP);

let light_samples = [];         // Array of light samples
let lightsample_timer;          // Used as pointer to timer
let start_timer;                // Used as pointer to timer
let lightsample_time_ms = 7;    // Light sample wait period (timer)


function startDelay(){

    if ( MQTT.isConnected() ){

        print("MQTT not connected.");
        print("Retrying...");
        print("");

    } else {
        Timer.del(start_timer);

        for (let i = 0; i <= 50 ; i++){
            print("");
        }
        print("System Start");
    
        lightsample_timer = Timer.set(lightsample_time_ms, Timer.REPEAT, sampleLight, null);
        Timer.set(1000, Timer.REPEAT, sendSample, null);
    }
}


function sampleLight(){
    light_samples.push( ADC.read(PIN_ADC_LIGHT) );
}

function sendSample(){
    Timer.del(lightsample_timer);
    print();
    print("Light samples:", light_samples.length);
    updateLightsampleTimeMs()

    PublishLight();

    lightsample_timer = Timer.set(lightsample_time_ms, Timer.REPEAT, sampleLight, null);
}

function updateLightsampleTimeMs(){
    if(light_samples.length < 120 && lightsample_time_ms > 1){
        lightsample_time_ms--;
        print("Increasing sample speed: ", lightsample_time_ms)
    } else if (light_samples.length > 140){
        lightsample_time_ms++;
        print("Decreasing sample speed: ", lightsample_time_ms)
    }
}

start_timer = Timer.set(1000, Timer.REPEAT, startDelay, null);

function PublishLight(){
    let text = JSON.stringify({data: light_samples});
    MQTT.pub('group8/esp32B/light', text, 0,0);
    light_samples = [];
}


//GPIO.set_mode(PIN_MOTION, GPIO.PULL);
GPIO.setup_input(PIN_MOTION, GPIO.PULL_UP);

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

function ADC_function_1() {
    ADC.enable(PIN_ADC_LIGHT);
    let adc_value_1 = ADC.read(PIN_ADC_LIGHT);
    light_array[count_increment_1++] = adc_value_1;
    !ADC.enable(PIN_ADC_LIGHT);
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
Timer.set(5, Timer.REPEAT, ADC_function_2, null);
Timer.set(1000, Timer.REPEAT, print_array, null);