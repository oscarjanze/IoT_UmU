const fs = require('fs');
const {execSync} = require('child_process');
//const fs = require('fs/promises');
let Gpio = require('onoff').Gpio;
let LED = new Gpio(4, 'out');
let button = new Gpio(14, 'in', 'both',{debounceTimeout: 100});
let status = 0;

const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost');

let toneCounter = 0;
let toneArray = [];
let queue_array = [];
var queue_timer;
let queue_index;
let queue_length = 0;


client.on('connect', function(){
	client.subscribe('group8');
});
function startInterval(note_array) {
	endInterval();
	console.log("note_array", note_array);
	console.log("queue_array", queue_array);
	
	
	for(var i = 1; i < note_array.length; i++) {
		queue_array[i-1] = Number(note_array[i]);
		//console.log("Array is:", queue_array );
	}
	queue_length = queue_array.length;
	queue_index = 0;
	queue_timer = setInterval(send_notes_from_queue, 200);}

function endInterval() {
	queue_array.length = 0;
	clearInterval(queue_timer);
	}

function send_notes_from_queue() {
	if (queue_index < queue_length){
		
	//console.log('\033[2J');
	console.log("queue_index: ", queue_index);
	console.log("running: ", queue_array);
	//console.log("note:",note, "at index", queue_index);

		client.publish('group8', JSON.stringify({device: 'esp32_2', tone: queue_array[queue_index]}));
		
	} else if(queue_index >= queue_array.length) {
		console.log("Interval is off now");
		client.publish('group8', JSON.stringify("Hope you liked it! <3"));
		endInterval();
	}

	queue_index++;
}

function button_callback(err, value){
	
			console.log("Button pressed.");
						console.log("val:",value);
						
	if (value === 0){
		toneCounter = 0;
		toneArray = [];
		let x = 0;
		let stringToSend = fs.readFile('/home/group8-rpi/musicfile.txt', (err, data) => {
				if (err) throw err;
				data = data.toString();
				data = data.split(',');
				startInterval(data);
				
			});	
	}
}
button.watch(button_callback);

function timer_callback(){
	if (status === 1 && LED.readSync() === 0) {
		LED.writeSync(1);
	}
	else if (status === 1 && LED.readSync() === 1) {
		LED.writeSync(0);
	}
	else {
		LED.writeSync(0);
	}
}
my_interval = setInterval(timer_callback, 200);


function message_callback(topic, message){
	// message is Buffer
	console.log("Msg received:", message.toString());
	
	let command;
	let payload;
	let tone;
	let device;
	
	
	try {
		let incoming = JSON.parse(message);
		device = incoming.device;
		tone = incoming.tone;
	} catch {
		command = message.toString();
	}
		
	
	if(device === "esp32_1") {
		toneArray[toneCounter++] = tone;
		fs.open('/home/group8-rpi/musicfile.txt', 'w', (err, fd) => {
			if (err) throw err;
				//use stat
				fs.fstat(fd, (err, stat) => {
					if (err) throw err;
					
						fs.write(fd, toneArray, (err) => {
							if (err) throw err;
							});
					
				//Always close the file descriptor!!!
				fs.close(fd, (err) => {
					if (err) throw err;
				});
			});
		});
	}
	
	if(command === "Send me the music!") {
		
	}
}
client.on('message', message_callback);

