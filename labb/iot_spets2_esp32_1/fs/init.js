load('api_timer.js');
load('api_gpio.js');
load('api_i2c.js');
load('api_pwm.js');
load('api_sys.js');
load('api_pwm.js');
load('api_wifi.js');
load('api_mqtt.js');


let MCP9808_I2CADDR = 0x70; // 0x00011000 std slave address
let MCP9808_REG_AMBIENT_TEMP = 0x05; // 0b00000101 temp data reg


let PIN_LEDR = 15; // red LED #1
let PIN_LEDG = 32; // green LED #2
let PIN_LEDY = 14; // yellow LED #3
let PIN_BTN1 = 21;
let PIN_BTN2 = 4;
let PIN_PWM = 17;
let string = "";
let ton = 0;
let temp_timer = 0;
let id;
GPIO.set_pull(PIN_BTN1, GPIO.PULL_UP);
GPIO.setup_output(PIN_LEDR, 0);

//print("ADC enabled!", ADC.enable(PIN_ADC1));


function i2c_function() {
    let i2c_h = I2C.get(); // I2C handle
    let write_1 = I2C.writeRegB(i2c_h, 0x70, 0x00, 0x51);
    Sys.usleep(100 * 1000);
    let reading_1 = I2C.readRegW(i2c_h, 0x70, 2);
    print("Read: ",reading_1);
    print("Write: ",write_1);
    ton = 2*reading_1;
}

function piezo_buzzer(){

    let count = 0;
    //let array = [];
    ton = 200;
    i2c_function();
    try_send();
    if(temp_timer + 10 < Timer.now()){
        Timer.del(id);
    }

}

GPIO.set_button_handler(PIN_BTN1, GPIO.PULL_UP, GPIO.INT_EDGE_ANY, 100, 
	function(x) {
		if (!GPIO.read(x)){
			//Check if Button 2 is also pressed
			let res = MQTT.pub('group8', "Button 1 on", 1);
			print('Btn 1 on, Published:', res ? 'yes' : 'no');
            temp_timer = Timer.now();
            id = Timer.set(100, Timer.REPEAT, piezo_buzzer, null);
		}
	}, null);

function try_send(){
    let text = JSON.stringify({device: 'esp32_1', tone: ton});
    MQTT.pub('group8', text, 0,0);
}


