load('api_timer.js');
load('api_gpio.js');
load('api_adc.js');
load('api_i2c.js');
load('api_math.js');
load('api_pwm.js');

let PIN_LEDR = 15;      // red LED
let PIN_LEDG = 32;      // green LED
let PIN_LEDY = 14;      // yellow LED
let PIN_BTN_BLACK = 21; // Black button
let PIN_BTN_BROWN = 4;  // Brown button
let PIN_POT = 36;       // Potentiometer
let MCP9808_I2CADDR = 0x18; // 0x00011000 std slave address
let MCP9808_REG_AMBIENT_TEMP = 0x05; // 0b00000101 temp data reg
let PIN_LINUS = 33;


GPIO.setup_input(PIN_BTN_BLACK, GPIO.PULL_DOWN);
GPIO.setup_input(PIN_BTN_BROWN, GPIO.PULL_DOWN); 
GPIO.setup_output(PIN_LEDR, 1);
GPIO.setup_output(PIN_LEDG, 1);
GPIO.setup_output(PIN_LEDY, 1);
GPIO.setup_output(PIN_LINUS, 0);
ADC.enable(PIN_POT)

let redCount = 0;
let yellowCount = 0;
let greenCount = 0;
let count_brown = 0;
let toggle_value_speaker = 0;

function updateTemp() {
    let i2c_h = I2C.get(); // I2C handle
    let t = I2C.readRegW(i2c_h, MCP9808_I2CADDR, MCP9808_REG_AMBIENT_TEMP);
    let tempC = t & 0x0fff; // bitwise AND to strip non-temp bits
    tempC = tempC/16.0; // convert to decimal
    return Math.round(tempC);
}




GPIO.set_button_handler(PIN_BTN_BLACK, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 200,
    function(x) {
      //print('Button press, pin: ', x);
    }, null);

GPIO.set_button_handler(PIN_BTN_BROWN, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 200,
    function(x) {
        print('Brown button has been pressed ', count_brown++, ' times');
        GPIO.toggle(PIN_LEDG);
    }, null);


function ADC_reader() {
    let voltage = 0;
    let Conversion = 10/4095;
    voltage = ADC.read(PIN_POT) * Conversion + 20;

    voltage = Math.round(voltage);

    return voltage;
}


function min_timer_callback(){

    let temp = updateTemp();
    print("Temperature:", temp);

    let pot_value = ADC_reader();
    print('Pot is', pot_value);

    if (temp > pot_value) {
        GPIO.toggle(PIN_LEDR);

        if (toggle_value_speaker === 0){
            PWM.set(PIN_LINUS, 800, 0.5);
            toggle_value_speaker = 1;
            print('spk0', toggle_value_speaker);
        } else {
            PWM.set(PIN_LINUS, 1000, 0.5);
            print('spk1', toggle_value_speaker);
            toggle_value_speaker = 0;
        }


        print("It's hot!");

    } else {
        PWM.set(PIN_LINUS, 2000, 0);

        GPIO.write(PIN_LEDR, 1);
    }

    //print('Red har blinkat', redCount++, 'times');
    //GPIO.toggle(PIN_LEDR);
    
    // print('Black button: ', GPIO.read(PIN_BTN_BLACK));
    if (GPIO.read(PIN_BTN_BLACK) === 0) {
        //print('Yellow has blinked', yellowCount++, 'times');
        GPIO.toggle(PIN_LEDY);
    }
}
Timer.set(1000, Timer.REPEAT, min_timer_callback, null);