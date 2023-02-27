load('api_timer.js');
let sekunder = 0;
let minuter = 0;
function min_timer_callback(){    
    print('Minuter:', + minuter, 'Sekunder:', + sekunder++);
    if(sekunder === 60) {
        minuter++;
        sekunder = 0;
    }
}
Timer.set(1000, Timer.REPEAT, min_timer_callback, null);