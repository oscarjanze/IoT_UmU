load('api_spi.js');
load('api_sys.js');
load('api_timer.js');
load('api_gpio.js');
load('api_adc.js');
load('api_i2c.js');
load('api_pwm.js');


let PIN_LCD_RS = 16;
let spi_h = SPI.get();
let spi_param = {cs: 0, mode: 0, freq: 100000, hd: {tx_data: "", rx_len: 0}};

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
    lcd_cmd("\x0F");
    Sys.usleep(30*1000);
    lcd_cmd("\x01");
    Sys.usleep(30*1000);
    lcd_cmd("\x06");

}

function lcd_cmd(cmd){
    GPIO.write(PIN_LCD_RS, 0); // RS low for cmd
    spi_param.hd.tx_data = cmd;
    SPI.runTransaction(spi_h, spi_param);
    //GPIO.write(PIN_LCD_RS, 1); // RS low for cmd
}



lcd_init();
GPIO.write(PIN_LCD_RS, 1);


//
//print("Init done!");
//
//
//lcd_cmd("1111");
//
//lcd_cmd('a');
//Timer.set(4000, Timer.REPEAT, check_limit, null);