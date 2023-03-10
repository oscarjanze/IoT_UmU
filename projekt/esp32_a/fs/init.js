// ESP32 - A (Window)
load('api_timer.js');
load('api_gpio.js');
load('api_i2c.js');
load('api_pwm.js');
load('api_wifi.js');
load('api_mqtt.js');
load('api_math.js');
load('api_dht.js');
load('api_adc.js');

let MCP9808_I2CADDR = 0x18; // 0x00011000 std slave address
let MCP9808_REG_AMBIENT_TEMP = 0x05; // 0b00000101 temp data reg
let PIN_MOIST = 14;
let PIN_ADC_LIGHT = 36;
//let PIN_ADC_MIC = 39;
//let PIN_SOUND_TRIGGER = 21;

//GPIO.set_mode(PIN_SOUND_TRIGGER, GPIO.MODE_INPUT);
//print("ADC enabled! PIN_ADC_MIC:", ADC.enable(PIN_ADC_MIC));
print("ADC enabled! PIN_ADC_LIGHT:", ADC.enable(PIN_ADC_LIGHT));


// Setup MOIST SENSOR
let dht = DHT.create(PIN_MOIST, DHT.DHT11);
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

function getMcpTemp() {
    // i2c_function
    let i2c_h = I2C.get(); // I2C handle
    let t = I2C.readRegW(i2c_h, MCP9808_I2CADDR, MCP9808_REG_AMBIENT_TEMP);
    let tempC = t & 0x0fff; // bitwise AND to strip non-temp bits
    tempC = tempC/16.0; // convert to decimal
    let tempC_rounded = Math.round(tempC *10) /10;
    return tempC_rounded;
}

function sampleLight(){
    light_samples.push( ADC.read(PIN_ADC_LIGHT) );
}

function sendSample(){
    Timer.del(lightsample_timer);
    print();
    print("Light samples:", light_samples.length);
    updateLightsampleTimeMs()
    

    PublishMoist();
    PublishTemp();
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


function PublishMoist(){
    let dht_humidity = dht.getHumidity();
    let text = JSON.stringify(dht_humidity);    
    MQTT.pub('group8/esp32A/moist', text, 0,0);
}
function PublishTemp(){
    let dht_temp = dht.getTemp();
    let mcp_temp = getMcpTemp();
    let avg_temp = (dht_temp + mcp_temp) / 2;

    let text = JSON.stringify({
        temp_MCP: mcp_temp, 
        temp_DHT: dht_temp, 
        tempAvg: avg_temp
    });

    MQTT.pub('group8/esp32A/temp', text, 0,0);   
}
function PublishLight(){
    let text = JSON.stringify({data: light_samples});
    MQTT.pub('group8/esp32A/light', text, 0,0);
    light_samples = [];
}



// GPIO.set_int_handler(PIN_SOUND_TRIGGER, GPIO.INT_EDGE_NEG, function(pin) {
//     print('Pin', pin, 'got interrupt');
// }, null);

// GPIO.enable_int(PIN_SOUND_TRIGGER);


// GPIO.set_button_handler(PIN_SOUND_TRIGGER, GPIO.PULL_DOWN, GPIO.INT_EDGE_ANY, 100, 
// 	function(x) {
// 		if (!GPIO.read(x)){
// 			//Check if Button is pressed
// 			print('PUSHED!');
// 		} else {
// 			let res = MQTT.pub('group8', "Button 1 off", 1);
// 			print('         RELEASED!');
// 		}
// 	}, null);




 // JSON.stringify({btn1: 1, btn2: 0}), 1);
    // let dht = {
    //     hum: dht_sensor.getHumidity(),
    //     temp: dht_sensor.getTemp()
    //   };
    
    // print("yo")
    // print("Stuff: ", dht.temp, dht.humidity );


    // let mic_value = ADC.read(PIN_ADC_MIC);
    // print("MIC IS:", mic_value);

    
    // print("GPIO", GPIO.read(PIN_SOUND_TRIGGER));