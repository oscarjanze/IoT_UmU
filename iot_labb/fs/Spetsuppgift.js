load('api_timer.js');
load('api_gpio.js');
load('api_adc.js');
load('api_i2c.js');
load('api_math.js');
load('api_pwm.js');
load('api_spi.js');
load('api_sys.js');

let PIN_LEDR = 15;      // red LED
let PIN_LEDG = 32;      // green LED
let PIN_LEDY = 14;      // yellow LED
let PIN_BTN_BLACK = 21; // Black button
let PIN_BTN_BROWN = 4;  // Brown button
let PIN_POT = 36;       // Potentiometer
let MCP9808_I2CADDR = 0x18; // 0x00011000 std slave address
let MCP9808_REG_AMBIENT_TEMP = 0x05; // 0b00000101 temp data reg
let PIN_LINUS = 12;
let PIN_LCD_RS = 27;
let PIN_LCD_CSB = 33;
//let PIN_LCD_SI = ;
//let PIN_LCD_CLK = ;


GPIO.setup_input(PIN_BTN_BLACK, GPIO.PULL_DOWN);
GPIO.setup_input(PIN_BTN_BROWN, GPIO.PULL_DOWN); 
GPIO.setup_output(PIN_LEDR, 1);
GPIO.setup_output(PIN_LEDG, 1);
GPIO.setup_output(PIN_LEDY, 1);
GPIO.setup_output(PIN_LINUS, 0);
GPIO.setup_output(PIN_LCD_RS, 1);
ADC.enable(PIN_POT);

let redCount = 0;
let yellowCount = 0;
let greenCount = 0;
let count_brown = 0;
let toggle_value_speaker = 0;

let spi_h = SPI.get();
let spi_param = {cs: 0, mode: 0, freq: 100000, hd: {tx_data: "", rx_len: 0}};

function lcd_init(){
    lcd_cmd("\x39");
    Sys.usleep(30*1000);
    lcd_cmd("\x15");
    Sys.usleep(30*1000);
    lcd_cmd("\x55");
    Sys.usleep(30*1000);
    lcd_cmd("\x6E");
    Sys.usleep(30*1000);
    lcd_cmd("\x72");
    Sys.usleep(30*1000);
    lcd_cmd("\x38");
    Sys.usleep(30*1000);
    lcd_cmd("\x0F");
    Sys.usleep(30*1000);
    lcd_cmd("\x01");
    Sys.usleep(30*1000);
    lcd_cmd("\x06");
    Sys.usleep(30*1000);
}

function lcd_cmd(cmd){
    GPIO.write(PIN_LCD_RS, 0); // RS low for cmd
    spi_param.hd.tx_data = cmd;
    SPI.runTransaction(spi_h, spi_param);
}

function lcd_clear(){
    lcd_cmd("\x01");
    Sys.usleep(30*1000);
}

function lcd_cursor(cell){
    // let command_dec = 128 + cell; // 128 - set ddram address
    // print('Made it this far 1.', command_dec);
    // let command_hex = decimalToHex(command_dec);    
    lcd_cmd(cell);
    Sys.usleep(30*1000);
}

function lcd_write(tecken){
    GPIO.write(PIN_LCD_RS, 1); // RS HIGH for text
    spi_param.hd.tx_data = tecken;
    SPI.runTransaction(spi_h, spi_param);
}


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

lcd_init();
// Disable cursor
lcd_cursor("\x0C");


Sys.usleep(200*1000);
lcd_cursor("\x80"); //0
lcd_write("Tempo:");

Sys.usleep(200*1000);
lcd_cursor("\x90");
lcd_write("Limit:");





function min_timer_callback(){


    let temp = updateTemp();
    let pot_value = ADC_reader();
    print("Temperature:", temp, ', Limit:', pot_value);
    let str_temp = temp;
    let str_limit = pot_value;

    
    lcd_cursor("\x87");
    lcd_write(JSON.stringify(temp) + "c");
    lcd_cursor("\x97");
    lcd_write(JSON.stringify(pot_value) + "c");
    lcd_cursor("\xA9");


    if (temp > pot_value) {
        GPIO.toggle(PIN_LEDR);


        if (toggle_value_speaker === 0){
            lcd_write("VARMT!");

            PWM.set(PIN_LINUS, ADC.read(PIN_POT)*2, 0.5);
            toggle_value_speaker = 1;
        } else {
            lcd_write("      ");

            PWM.set(PIN_LINUS, 1000, 0.5);
            toggle_value_speaker = 0;
        }

        print("It's hot!");

    } else {
        lcd_write("      ");

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