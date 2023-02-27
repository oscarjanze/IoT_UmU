load('api_timer.js');
load('api_gpio.js');
let PIN_LEDR = 15; // red LED
let PIN_LEDG = 32; // green LED
let PIN_LEDY = 14; // yellow LED

let PIN_BTN_BLACK = 21; //Black button
let PIN_BTN_BROWN = 4;  //Brown button

GPIO.setup_input(PIN_BTN_BLACK, GPIO.PULL_DOWN);
GPIO.setup_input(PIN_BTN_BROWN, GPIO.PULL_DOWN); 

GPIO.setup_output(PIN_LEDR, 1);
GPIO.setup_output(PIN_LEDG, 1);
GPIO.setup_output(PIN_LEDY, 1);

let redCount = 0;
let yellowCount = 0;
let greenCount = 0;
let count_brown = 1;


GPIO.set_button_handler(PIN_BTN_BLACK, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 200,
    function(x) {
      print('Button press, pin: ', x);
    }, null);

GPIO.set_button_handler(PIN_BTN_BROWN, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 200,
    function(x) {
        print('Brown button has been pressed ', count_brown++, ' times');
        GPIO.toggle(PIN_LEDG);
    }, null);


function min_timer_callback(){
    
    print('Red har blinkat', redCount++, 'times');
    GPIO.toggle(PIN_LEDR);
    
    print('Black button: ', GPIO.read(PIN_BTN_BLACK));
    if (GPIO.read(PIN_BTN_BLACK) === 0) {
        print('Yellow has blinked', yellowCount++, 'times');
        GPIO.toggle(PIN_LEDY);
    }
}
Timer.set(300, Timer.REPEAT, min_timer_callback, null);