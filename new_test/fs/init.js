load('api_spi.js');
load('api_sys.js');
load('api_gpio.js');

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
}


lcd_init();
print("init done!");

Sys.usleep(2000);

GPIO.write(PIN_LCD_RS, 1); // RS low for cmd

lcd_cmd(1010);

GPIO.write(PIN_LCD_RS, 0); // RS low for cmd
