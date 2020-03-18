//
// Module : MMM-MagicHome-Lights
//

'use strict'

const path = require('path')

const Discovery = require('magic-home').Discovery;
const Control = require('magic-home').Control;
const CustomMode = require('magic-home').CustomMode;

var mirror_init_pattern = new CustomMode();
var assistant_active_pattern = new CustomMode();

var NodeHelper = require("node_helper")

module.exports = NodeHelper.create({
  start: function() {
    console.log(this.name + " started");
    this.config = {}
    this.light_address = ''
    this.status = 'OFF'
    this.restart = false
  },

  initializeAfterLoading: async function(config) {
    this.config = config
    this.restart = this.config.autorestart
    this.initPatterns()
    await this.getLightAddress()
    this.deactivate_lights()
  },

  initPatterns: function() {
    this.config.assistant_active_pattern.forEach(function(element) {
      assistant_active_pattern.addColor(element.red, element.blue, element.green);
    });
    assistant_active_pattern.setTransitionType("fade");
    console.log(assistant_active_pattern)
  },

  socketNotificationReceived: function(notification, payload) {
    console.log("[MH-Lights] notif - " + notification)
    switch (notification) {

      case 'INIT':
        this.initializeAfterLoading(payload)
        this.sendSocketNotification('INITIALIZED')
        break
      case 'AL_RESUME':
        if (this.status == 'OFF') {
          this.status = 'ON'
          this.activate_assistant_lights()
          this.sendSocketNotification('RESUMED')
        } else {
          this.sendSocketNotification('NOT_RESUMED')
        }
        break
      case 'HL_RESUME':
        if (this.status == 'OFF') {
          this.status = 'ON'
          this.activate_hotword_lights()
          this.sendSocketNotification('RESUMED')
        } else {
          this.sendSocketNotification('NOT_RESUMED')
        }
        break
      case 'AL_PAUSE':
        if (this.status == 'ON') {
          this.status = 'OFF'
          this.deactivate_lights()
          this.sendSocketNotification('PAUSED')
        } else {
          this.sendSocketNotification('NOT_PAUSED')
        }
        break
    }
  },


  deactivate_lights: function() {
    var light = new Control(this.light_address);
    console.log("[MH-Lights] Lights deactivating...");
    light.turnOff();
    this.status = 'OFF'
  },

  activate_assistant_lights: function() {
    console.log("[MH-Lights] Assistant lights activating...");
    var light = new Control(this.light_address);
    light.turnOn();
    light.setCustomPattern(assistant_active_pattern, 90)
  },

  activate_hotword_lights: function() {
    console.log("[MH-Lights] Hotword lights activating...");
    var light = new Control(this.light_address);
    light.turnOn();
    light.setCustomPattern(hotword_active_pattern, 90)
  },


  getLightAddress: async function() {
    if (this.config.light_address == 'DISCOVER') {
      var disc = new Discovery();
      var device = null;
      var retry = 10;
      while (device == null && retry > 0){
        await disc.scan(1000, function(err, devices) {
          if(devices.length != 0) {
            console.log("[MH-Lights]Found following MagicHome devices.");
            console.log(devices);
            device = devices[0].address;
          }
        }).then().catch();
        retry--;
      }
      this.light_address = device;
    } else {
      this.light_address = this.config.light_address;
    }
    console.log("[MH-Lights] light_address = " + this.light_address)
  },
})
