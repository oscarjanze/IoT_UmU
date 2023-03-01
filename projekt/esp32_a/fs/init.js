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


// let PIN_LEDR = 15; // red LED #1
// let PIN_LEDG = 32; // green LED #2
// let PIN_LEDY = 14; // yellow LED #3
// let PIN_BTN1 = 21;
// let PIN_BTN2 = 4;
// let PIN_ADC1 = 36;
let PIN_MOIST = 14;
let PIN_ADC_LIGHT = 36;
let PIN_ADC_MIC = 39;
let PIN_SOUND_TRIGGER = 4;

GPIO.set_pull(PIN_SOUND_TRIGGER, GPIO.PULL_DOWN);


print("ADC enabled! PIN_ADC_LIGHT:", ADC.enable(PIN_ADC_LIGHT));
print("ADC enabled! PIN_ADC_MIC:", ADC.enable(PIN_ADC_MIC));


// Setup MOIST SENSOR
let dht = DHT.create(PIN_MOIST, DHT.DHT11);
let temp_limit = 0; //temporary limit
let tempC_rounded = 0; //temporary temperature

GPIO.set_button_handler(PIN_SOUND_TRIGGER, GPIO.PULL_DOWN, GPIO.INT_EDGE_ANY, 100, 
	function(x) {
		if (!GPIO.read(x)){
			//Check if Button is pressed
			print('PUSHED!');
		} else {
			let res = MQTT.pub('group8', "Button 1 off", 1);
			print('         RELEASED!');
		}
	}, null);


function i2c_function() {
    print();
    print();
    print();

    let i2c_h = I2C.get(); // I2C handle
    let t = I2C.readRegW(i2c_h, MCP9808_I2CADDR, MCP9808_REG_AMBIENT_TEMP);
    let tempC = t & 0x0fff; // bitwise AND to strip non-temp bits
    tempC = tempC/16.0; // convert to decimal
    tempC_rounded = Math.round(tempC *10) /10;
    
    //let text = JSON.stringify(temp_tempC);
    //MQTT.pub('group8/temp', text, 0,0);


    let dht_temp = dht.getTemp();
    let dht_humidity = dht.getHumidity();



    if (isNaN(dht_humidity) || isNaN(dht_temp)) {
        print('Failed to read data from sensor');
    } else {
        print('Temperature:', dht_temp, '*C');
        print('Humidity:', dht_humidity, '%');
    }
    print("Temp:", tempC_rounded);
    print("AvgTemp:", (tempC_rounded+dht_temp)/2);

    let light_value = ADC.read(PIN_ADC_LIGHT);
    print("LIGHT IS:", light_value);

    let mic_value = ADC.read(PIN_ADC_MIC);
    print("MIC IS:", mic_value);

}

Timer.set(5000, Timer.REPEAT, i2c_function, null);

