load('api_timer.js');
load('api_gpio.js');
let PIN_LEDR = 15; // red LED
let PIN_LEDG = 32; // green LED
let PIN_LEDY = 14; // yellow LED
GPIO.setup_output(PIN_LEDR, 0);
GPIO.setup_output(PIN_LEDG, 1);
GPIO.setup_output(PIN_LEDY, 0);
let count = 0;
function min_timer_callback(){
 print('hej:', count++);
 GPIO.toggle(PIN_LEDR);
 GPIO.toggle(PIN_LEDG);
 GPIO.toggle(PIN_LEDY);
}
Timer.set(1000, Timer.REPEAT, min_timer_callback, null);