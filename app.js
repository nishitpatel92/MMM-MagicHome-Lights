var MagicHomeDiscovery = require('magic-home').Discovery;
var MagicHomeControl = require('magic-home').Control;
var CustomMode = require('magic-home').CustomMode;

let my_effect = new CustomMode();

my_effect
	.addColor(0, 80, 255)
	.addColor(0, 20, 65)
	.setTransitionType("fade");


var discovery = new MagicHomeDiscovery();
discovery.scan(1000, function(err, devices) {
		console.log(devices);
		var light = new MagicHomeControl(devices[0].address);
		light.setCustomPattern(my_effect, 100);
		light.turnOn();
		console.log("done")
});
