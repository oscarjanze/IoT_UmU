module.exports = function(RED) {

  const spi = require('spi-device');
  let Gpio = require('onoff').Gpio;
  const hex = require('string-hex');
  let LCD_PIN_RS = new Gpio(6, 'out');

    async function transer_to_display(cmd) {
    //Set RS to low for command
    //LCD_PIN_RS.writeSync(0);
    //Hämta spi
      console.log(cmd)
    //let hexString = cmd.toString(16);
    
      const Dog_display = spi.open(0,0, err => {
      
      const message = [{
      sendBuffer: Buffer.from([cmd]),
      byteLength: 1,
      speedHz: 100000
      }];
      
      //console.log(message.sendBuffer);  
      Dog_display.transferSync(message);
      });
    }
    
    
    async function LCD_init(cursor = 1){
      console.log("cursor is:", cursor);
      LCD_PIN_RS.writeSync(0);
      
      transer_to_display(0x39);
      await new Promise(r => setTimeout(r, 30));
      transer_to_display(0x15);
      await new Promise(r => setTimeout(r, 30));
      transer_to_display(0x55);
      await new Promise(r => setTimeout(r, 30));
      transer_to_display(0x6e);
      await new Promise(r => setTimeout(r, 30));
      transer_to_display(0x72);
      await new Promise(r => setTimeout(r, 30));
      transer_to_display(0x38);
      await new Promise(r => setTimeout(r, 30));
      
      
      //Set cursor 0x0F for blinking curs
      //Set cursor 0x0E for solid curs
      //Set cursor 0x0C for no curs
      if (cursor === 0){
        transer_to_display(0x0C);
        console.log("cursor off");

      } else {
        transer_to_display(0x0F);
        console.log("cursor on");

      }
      
      await new Promise(r => setTimeout(r, 30));
      transer_to_display(0x01);
      await new Promise(r => setTimeout(r, 30));
      transer_to_display(0x06);
      await new Promise(r => setTimeout(r, 30));
      LCD_PIN_RS.writeSync(1);
      
    }

    async function send_me_text(string){
      LCD_PIN_RS.writeSync(1);

      //await new Promise(r => setTimeout(r, 1000));
      for (let i = 0; i < string.length; i++){
        transer_to_display(('0x'+hex(string[i])));
        await new Promise(r => setTimeout(r, 30));
      }
      
    }


   
    function RemoveFirstWord(input){
      let x1 = input.split(" ");
      console.log("x1:", x1);

      let x2 = x1.slice(1);
      console.log("x2:", x2);
      
      let x3 = x2.join(" ");
      console.log("x3:", x3);
      
      return x3;
    }

    async function clear_display(){
        //await new Promise(r => setTimeout(r, 5000));
        LCD_PIN_RS.writeSync(0);
        transer_to_display(0x01);
        await new Promise(r => setTimeout(r, 5000));

    }
    
    async function init_function(){
      await LCD_init();
      //await send_me_text("Welcome !"); 
      //console.log("Chill");
      await new Promise(r => setTimeout(r, 1000));
      clear_display();
    }

    init_function();

  function DogDisplayNode(config) {
    RED.nodes.createNode(this,config);
    const node = this;
    node.location = config.location;

    node.on('input', function(msg){
      
     
      
      let input = msg.payload;
      
      console.log("disp_input=", input);
      
      if(input == "//init"){
        LCD_init();
        
      } else if(input == "//init-nocursor"){
        LCD_init(0);
        
      } else if(input == "//clear"){
        clear_display();
      
      } else if(input.startsWith("//clear") ){
        console.log("-----")
        clear_display();
        let text = RemoveFirstWord(input);
        console.log("text:", text);

        send_me_text(text);
        
      } else if(input == "//row1"){
        LCD_PIN_RS.writeSync(0);
        transer_to_display(0x80);
      
      } else if(input == "//row2"){
        LCD_PIN_RS.writeSync(0);
        transer_to_display(0x90);
      
      } else if(input == "//row3"){
        LCD_PIN_RS.writeSync(0);
        transer_to_display(0xA0);
      
      }
       else {
          send_me_text(input);
      }
      
      
      
      node.send(msg);
      })
    
    
    


    //send_msg();
    //----------------------------------------
  }
    RED.nodes.registerType("dog-disp",DogDisplayNode);

}






//await new Promise(r => setTimeout(r, 1000));

