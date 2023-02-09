load('api_timer.js');
load('api_gpio.js');
load('api_i2c.js');
load('api_pwm.js');
load('api_sys.js');
load('api_pwm.js');
load('api_wifi.js');
load('api_mqtt.js');


let MCP9808_I2CADDR = 0x70; // 0x00011000 std slave address
let MCP9808_REG_AMBIENT_TEMP = 0x05; // 0b00000101 temp data reg


let PIN_LEDR = 15; // red LED #1
let PIN_LEDG = 32; // green LED #2
let PIN_LEDY = 14; // yellow LED #3
let PIN_BTN1 = 21;
let PIN_BTN2 = 4;
let PIN_PWM = 17;
let string = "";
let ton = 0;


GPIO.set_pull(PIN_BTN1, GPIO.PULL_UP);
GPIO.setup_output(PIN_LEDR, 0);

//print("ADC enabled!", ADC.enable(PIN_ADC1));

function clearLog(){
	for (let i = 0; i < 30; i++) {
		print("");
	}
}

clearLog();
print("test");

MQTT.sub('group8', function(conn, topic, msg) {

    print();
    //print('Recieved MQTT Message');
	//print('Topic:', topic, ', Message:', msg);

    let decoded_msg = JSON.parse(msg);
    let device = decoded_msg.device;
    let tone = decoded_msg.tone;
    //let data = decoded_msg.data;

    print("Dev ",device);
    print("Tone ",tone);

    if(device === "Raspberry"){
        //Kan inte ta emot något vettigt från raspberry.
        //Hitta antingen delay-funktion i nodejs
        //eller hantera lång sträng array :)
        //piezo_buzzer(tone*10);
    }

    if(device === "esp32_1"){
        piezo_buzzer(tone*10);
    }
    
    

}, null);

GPIO.set_button_handler(PIN_BTN1, GPIO.PULL_UP, GPIO.INT_EDGE_ANY, 100, 
	function(x) {
		//Pull-up, 
		if (!GPIO.read(x)){
			//Check if Button 2 is also pressed
			print('Btn 1 on');
            piezo_buzzer(1000);
		}
	}, null);


function piezo_buzzer(tone){

    PWM.set(PIN_PWM, tone, 0.5);
    Sys.usleep(1000 * 100);
    PWM.set(PIN_PWM, tone, 0.0);
}

//Timer.set(1000, Timer.REPEAT, piezo_buzzer, null);


/*
function min_timer_callback(){
	// Rensa lite i loggen för läsbarhet
		clearLog();
}
Timer.set(200, Timer.REPEAT, min_timer_callback, null);*/