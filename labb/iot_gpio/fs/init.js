load('api_timer.js');
load('api_gpio.js');
let PIN_LEDR = 15; // red LED #1
let PIN_LEDG = 32; // green LED #2
let PIN_LEDY = 14; // yellow LED #3
let PIN_BTN1 = 21;
let PIN_BTN2 = 4;
let toggle = 0;
let num = 0;
let release = 0;

GPIO.setup_output(PIN_LEDR, 0);
GPIO.setup_output(PIN_LEDG, 1);
GPIO.setup_output(PIN_LEDY, 0);
GPIO.set_pull(21, GPIO.PULL_UP);
GPIO.set_pull(4, GPIO.PULL_UP);

let count = 0;
function min_timer_callback(){    
    GPIO.toggle(PIN_LEDR);
}

function button1_pressed() {
    if(GPIO.read(PIN_BTN1) === 0) {
        GPIO.toggle(PIN_LEDG);
    }
    else {
        GPIO.write(PIN_LEDG, 0);
    }
}

function button2_pressed() {
    if(GPIO.read(PIN_BTN2) === 0 && release === 0) {
        //Har vi på knappen tidigare?
        if(GPIO.read(PIN_LEDY) === 0 && toggle === 0) {
            GPIO.write(PIN_LEDY, 1);
            toggle = 1;
        } 
        else if(toggle === 1) {
            GPIO.write(PIN_LEDY, 0);
            toggle = 0;
        }
        
        release = 1;
        num++;
        print('Button 2 pressed!', +num);
    }

    if (GPIO.read(PIN_BTN2))
    {
        release = 0;
    }
}
Timer.set(1000, Timer.REPEAT, min_timer_callback, null);
Timer.set(200, Timer.REPEAT, button1_pressed, null);
Timer.set(100, Timer.REPEAT, button2_pressed, null);