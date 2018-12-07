# Canvas DPI Scaler

Utility to scale `<canvas>` for Retina and other high resolution screens.

### Usage: 

*Install with npm or \<script\>:* `npm install canvas-dpi-scaler` or `<script href='canvas-dpi-scaler.js'>`

#### `canvasDpiScaler(canvas, context, [customWidth], [customHeight])`

```js
var canvasDpiScaler = require('canvas-dpi-scaler'),
    canvas = document.getElementById('some-canvas-el'),
    context = canvas.getContext('2d');
    
canvasDpiScaler(canvas, context); // That's it; you're done!
```

### About

Based on [this HTML5 rocks article](http://www.html5rocks.com/en/tutorials/canvas/hidpi/).

Written by [@ChrisPolis](http://twitter.com/ChrisPolis), under [MIT License](http://opensource.org/licenses/mit-license.php).

### Demo Screenshot *(from Retina MBP)*
![demo](https://raw.githubusercontent.com/cmpolis/canvas-dpi-scaler/master/demo-screen.png)
