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


GPIO.set_pull(PIN_BTN1, GPIO.PULL_UP);
GPIO.setup_output(PIN_LEDR, 0);

//print("ADC enabled!", ADC.enable(PIN_ADC1));


function i2c_function() {

    let i2c_h = I2C.get(); // I2C handle
    let write_1 = I2C.writeRegB(i2c_h, 0x70, 0x00, 0x51);
    Sys.usleep(100 * 1000);
    let reading_1 = I2C.readRegW(i2c_h, 0x70, 2);
    print("Read: ",reading_1);
    //let write_2 = I2C.writeRegB(i2c_h, 0x70, 0x00, 0x51);
    //Sys.usleep(100 * 1000);
    //let reading_2 = I2C.readRegB(i2c_h, 0x70, 3);
    //print("Read: ",reading_2);
    print("Write: ",write_1);
    //print("Write: ",write_2);
    //print("Who: " ,string);
    ton = 2*reading_1;
}



function piezo_buzzer(){

    let startTime = Timer.now();
    let count = 0;
    let array = [];

    if(GPIO.read(PIN_BTN1) === 0)
    {
        while (startTime + 10 > Timer.now()) {
            i2c_function();
            PWM.set(PIN_PWM, ton, 0.5);
            Sys.usleep(1000 * 250);
            array[count] = ton;
            count++;
        }
        PWM.set(PIN_PWM, 0, 0.5);
        let text = JSON.stringify(array);
        MQTT.pub('group8', text, 1);

    }

}

Timer.set(1000, Timer.REPEAT, piezo_buzzer, null);
//Timer.set(500, Timer.REPEAT, i2c_function, null);