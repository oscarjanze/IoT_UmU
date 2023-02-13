load('api_timer.js');
let count = 0;
let minutes = 0;
function min_timer_callback(){
    if (count > 59) {
        minutes++;
        count = 0;
    }
    print(minutes, 'minutersssss och', count++,  'sekunder');
}
Timer.set(1000, Timer.REPEAT, min_timer_callback, null);
