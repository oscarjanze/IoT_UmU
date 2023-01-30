load('api_spi.js');
load('api_sys.js');
load('api_timer.js');
load('api_gpio.js');
load('api_adc.js');
load('api_i2c.js');
load('api_pwm.js');


let MCP9808_I2CADDR = 0x18; // 0x00011000 std slave address
let MCP9808_REG_AMBIENT_TEMP = 0x05; // 0b00000101 temp data reg
let PIN_LCD_RS = 16;
let spi_h = SPI.get();
let spi_param = {cs: 0, mode: 0, freq: 100000, hd: {tx_data: "", rx_len: 0}};
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

print("ADC enabled!", ADC.enable(PIN_ADC1));


GPIO.setup_output(PIN_LCD_RS, 0);

function lcd_init(){
    Sys.usleep(30*1000);
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
    lcd_cmd("\x0C");
    Sys.usleep(30*1000);
    lcd_cmd("\x01");
    Sys.usleep(30*1000);
    lcd_cmd("\x06");

}

function lcd_cmd(cmd){
    GPIO.write(PIN_LCD_RS, 0); // RS low for cmd
    spi_param.hd.tx_data = cmd;
    SPI.runTransaction(spi_h, spi_param);
}

function i2c_function() {

    let i2c_h = I2C.get(); // I2C handle
    let t = I2C.readRegW(i2c_h, MCP9808_I2CADDR, MCP9808_REG_AMBIENT_TEMP);
    let tempC = t & 0x0fff; // bitwise AND to strip non-temp bits
    tempC = tempC/16.0; // convert to decimal
    temp_tempC = tempC;
}

function ADC_function() {
    
    let adc_value = ADC.read(PIN_ADC1);
    let volts = adc_value/4095.0; // 0 - 1
    let limit = volts*40; // 0 - 40 grader
    temp_limit = limit;
}

lcd_init();

GPIO.write(PIN_LCD_RS, 1); // RS low for cmd
spi_param = {cs: 0, mode: 0, freq: 1, hd: {tx_data: "Hejsan", rx_len: 0}};
SPI.runTransaction(spi_h, spi_param);
GPIO.write(PIN_LCD_RS, 0); // RS low for cmd

Sys.usleep(50*10000);
Sys.usleep(50*10000);


print("Init done!");

lcd_cmd("\x0f");

i2c_function();
i2c_function();
// aktuell temperatur, temperaturgräns samt eventuell VARMT!-indikation
lcd_cmd("\x01");

function check_limit() {
    
    //Write to display

    GPIO.write(PIN_LCD_RS, 1); // RS low for cmd
    spi_param = {cs: 0, mode: 0, freq: 100000, hd: {tx_data: " Temp: " , rx_len: 0}};
    SPI.runTransaction(spi_h, spi_param);
    GPIO.write(PIN_LCD_RS, 0); // RS low for cmd

    GPIO.write(PIN_LCD_RS, 1); // RS low for cmd
    spi_param = {cs: 0, mode: 0, freq: 100000, hd: {tx_data: JSON.stringify(Math.round(temp_tempC)) , rx_len: 0}};
    SPI.runTransaction(spi_h, spi_param);
    GPIO.write(PIN_LCD_RS, 0); // RS low for cmd

    GPIO.write(PIN_LCD_RS, 1); // RS low for cmd
    spi_param = {cs: 0, mode: 0, freq: 100000, hd: {tx_data: "        " , rx_len: 0}};
    SPI.runTransaction(spi_h, spi_param);
    GPIO.write(PIN_LCD_RS, 0); // RS low for cmd

    GPIO.write(PIN_LCD_RS, 100); // RS low for cmd
    spi_param = {cs: 0, mode: 0, freq: 100000, hd: {tx_data: "limit: " , rx_len: 0}};
    SPI.runTransaction(spi_h, spi_param);
    GPIO.write(PIN_LCD_RS, 0); // RS low for cmd

    GPIO.write(PIN_LCD_RS, 1); // RS low for cmd
    spi_param = {cs: 0, mode: 0, freq: 100000, hd: {tx_data: JSON.stringify(Math.round(temp_limit)) , rx_len: 0}};
    SPI.runTransaction(spi_h, spi_param);
    GPIO.write(PIN_LCD_RS, 0); // RS low for cmd



    //Write to last line on DOGM163
    //
    if (temp_tempC > temp_limit){
        GPIO.toggle(PIN_LEDR);
        PWM.set(PIN_PWM, 200, 0.5);
        GPIO.write(PIN_LCD_RS, 1); // RS low for cmd
        spi_param = {cs: 0, mode: 0, freq: 100000, hd: {tx_data: "       VARMT          ", rx_len: 0}};
        SPI.runTransaction(spi_h, spi_param);
        GPIO.write(PIN_LCD_RS, 0); // RS low for cmd
    }
    else {
        PWM.set(PIN_PWM, 0, 0.5);
        GPIO.write(PIN_LEDR, 0);
        GPIO.write(PIN_LCD_RS, 1); // RS low for cmd
        spi_param = {cs: 0, mode: 0, freq: 100000, hd: {tx_data: "                      " , rx_len: 0}};
        SPI.runTransaction(spi_h, spi_param);
        GPIO.write(PIN_LCD_RS, 0); // RS low for cmd
    }
}

Timer.set(100, Timer.REPEAT, i2c_function, null);
Timer.set(1000, Timer.REPEAT, ADC_function, null);
Timer.set(500, Timer.REPEAT, check_limit, null);

//
//lcd_cmd("1111");
//
//lcd_cmd('a');
//Timer.set(4000, Timer.REPEAT, check_limit, null);