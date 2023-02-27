load('api_timer.js');
load('api_gpio.js');
load('api_adc.js');

let PIN_LEDR = 15; // red LED #1
let PIN_LEDG = 32; // green LED #2
let PIN_LEDY = 14; // yellow LED #3
let PIN_BTN1 = 21;
let PIN_BTN2 = 4;
let PIN_ADC1 = 36;


GPIO.setup_output(PIN_LEDR, 0);
GPIO.setup_output(PIN_LEDG, 0);
GPIO.setup_output(PIN_LEDY, 0);
GPIO.set_pull(21, GPIO.PULL_UP);
GPIO.set_pull(4, GPIO.PULL_UP);


print("ADC enabled!", ADC.enable(PIN_ADC1));

function ADC_function() {
    
    
    let adc_value = ADC.read(PIN_ADC1);
    let volts = adc_value/4095.0;
    print('ADC value:', + adc_value);
    let mv = volts*3300;
    print('mV:', + mv);


    if (mv>1000&&mv<2000){
        GPIO.write(PIN_LEDR, 1);
        GPIO.write(PIN_LEDG, 0);
        GPIO.write(PIN_LEDY, 0);
    }
    else if(mv>2000&&mv<3000)
    {
        GPIO.write(PIN_LEDR, 1);
        GPIO.write(PIN_LEDG, 1);
        GPIO.write(PIN_LEDY, 0);
    }
    else if(mv>3000){
        GPIO.write(PIN_LEDR, 1);
        GPIO.write(PIN_LEDG, 1);
        GPIO.write(PIN_LEDY, 1);
    }
    else {
        GPIO.write(PIN_LEDR, 0);
        GPIO.write(PIN_LEDG, 0);
        GPIO.write(PIN_LEDY, 0);
    }
}

Timer.set(500, Timer.REPEAT, ADC_function, null);