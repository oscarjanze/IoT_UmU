load('api_timer.js');
load('api_gpio.js');
load('api_i2c.js');
load('api_pwm.js');
load('api_wifi.js');
load('api_mqtt.js');


let MCP9808_I2CADDR = 0x18; // 0x00011000 std slave address
let MCP9808_REG_AMBIENT_TEMP = 0x05; // 0b00000101 temp data reg


let PIN_LEDR = 15; // red LED #1
let PIN_LEDG = 32; // green LED #2
let PIN_LEDY = 14; // yellow LED #3
let PIN_BTN1 = 21;
let PIN_BTN2 = 4;
let PIN_ADC1 = 36;
let PIN_PWM = 17;



let temp_limit = 0; //temporary limit
let temp_tempC = 0; //temporary temperature

GPIO.setup_output(PIN_LEDR, 0);

//print("ADC enabled!", ADC.enable(PIN_ADC1));


function i2c_function() {

    let i2c_h = I2C.get(); // I2C handle
    let t = I2C.readRegW(i2c_h, MCP9808_I2CADDR, MCP9808_REG_AMBIENT_TEMP);
    let tempC = t & 0x0fff; // bitwise AND to strip non-temp bits
    tempC = tempC/16.0; // convert to decimal
    print("Temperature:", Math.round(tempC));
    temp_tempC = Math.round(tempC);
    let text = JSON.stringify({device: 'esp32_A', temp: temp_tempC});
    MQTT.pub('group8', text, 0,0);
}

Timer.set(1000, Timer.REPEAT, i2c_function, null);
//Timer.set(1000, Timer.REPEAT, ADC_function, null);
//Timer.set(200, Timer.REPEAT, check_limit, null);