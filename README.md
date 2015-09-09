# gamepads
A small js lib with no external dependencies aimed for working with html5 Gamepad API. 

This library is a wrapper for the HTML5 Gamepad API. 
It allows to add custom events into the mix.
``` 
  controller.on('L', this.onLPressed);
``` 
instead of 
``` 
  window.requestAnimationFrame(function()  {
    if(gamepad.buttons[2].pressed){
      /* ... */
       }
    });
```
