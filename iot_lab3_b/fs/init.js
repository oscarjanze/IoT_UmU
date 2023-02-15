load('api_timer.js');
load('api_gpio.js');
load('api_i2c.js');
load('api_pwm.js');
load('api_sys.js');
load('api_wifi.js');
load('api_mqtt.js');


let PIN_PWM = 17;
//let store_val = 0;

MQTT.sub('group8', function(conn, topic, msg) {

    //Init bugg???
    let decoded_msg = JSON.parse(msg);

    //Även med init bugg kan den parsa informationen
    let command = decoded_msg.temp;
    let device = decoded_msg.device;

    print("Debug ",msg);

    if(device === "esp32_A"){
        //Gör en fin övergång från 0 - 100 %

        print("msg! ", command);
        //fan_controller(command);
        if(command >= 22 && command <= 24) {
            //50% Duty-cycle
            fan_controller(0.5);
        }
        else if(command > 25) {
            //90% Duty-cycle 
            fan_controller(0.9);
        }
        else {
            //20% Duty-cycle
            fan_controller(0.2);
        }   
    }
    

}, null);



function fan_controller(cmd){
    
    PWM.set(PIN_PWM, 25000, cmd);

}


//Timer.set(1000, Timer.REPEAT, fan_controller, null);