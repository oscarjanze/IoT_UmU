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
    
    
    async function LCD_init(){
      
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
      transer_to_display(0x0F);
      await new Promise(r => setTimeout(r, 30));
      transer_to_display(0x01);
      await new Promise(r => setTimeout(r, 30));
      transer_to_display(0x06);
      await new Promise(r => setTimeout(r, 30));
      LCD_PIN_RS.writeSync(1);
      
    }

    async function send_me_text(string){
      //await new Promise(r => setTimeout(r, 1000));
      for (let i = 0; i < string.length; i++){
        transer_to_display(('0x'+hex(string[i])));
      }
      
    }


    function send_msg(){
      
      //await new Promise(r => setTimeout(r, 30));
      transer_to_display(0x01);
      //await new Promise(r => setTimeout(r, 300));
      LCD_PIN_RS.writeSync(1);
      
      //transer_to_display(0x56);

      
      
    }

    async function clear_display(){
        //await new Promise(r => setTimeout(r, 5000));
        LCD_PIN_RS.writeSync(0);
        transer_to_display(0x01);
    }



  function DogDisplayNode(config) {
    RED.nodes.createNode(this,config);
    const node = this;
    node.location = config.location;

    async function absolutley_not_init_function(){
      await LCD_init();
      await send_me_text("Hello !"); 
      console.log("Chill");
      await new Promise(r => setTimeout(r, 5000));
      clear_display();
    }
    
    
    

    //init_function();

    //send_msg();
    //----------------------------------------
  }
    RED.nodes.registerType("testspi",DogDisplayNode);

}






//await new Promise(r => setTimeout(r, 1000));

