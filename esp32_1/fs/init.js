load('api_timer.js');
load('api_gpio.js');
load('api_mqtt.js');
// load('api_adc.js');
// load('api_i2c.js');
// load('api_math.js');
// load('api_pwm.js');
// load('api_spi.js');
// load('api_sys.js');

let PIN_LEDR = 15;      // red LED
let PIN_LEDG = 32;      // green LED
let PIN_LEDY = 14;      // yellow LED
let PIN_LEDB = 33;      // blue LED


GPIO.setup_output(PIN_LEDR, 1);
GPIO.setup_output(PIN_LEDG, 1);
GPIO.setup_output(PIN_LEDY, 1);
GPIO.setup_output(PIN_LEDB, 1);


// let redCount = 0;
// let yellowCount = 0;
// let greenCount = 0;
// let count_brown = 0;
// let toggle_value_speaker = 0;

// let spi_h = SPI.get();
// let spi_param = {cs: 0, mode: 0, freq: 100000, hd: {tx_data: "", rx_len: 0}};


MQTT.sub('grupp8', function(conn, topic, msg) {
  print('Topic:', topic, 'message:', msg);
}, null);

let loop_counter = 1;

// function min_timer_callback(){
//     GPIO.toggle(PIN_LEDR);
     print('Loop #', loop_counter);
// }

// Timer.set(1000, Timer.REPEAT, min_timer_callback, null);