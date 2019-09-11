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

  initializeAfterLoading: function(config) {
    this.config = config
    this.restart = this.config.autorestart
    this.initPatterns()
    this.getLightAddress()
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
      case 'RESUME':
        if (this.status == 'OFF') {
          this.status = 'ON'
          this.activate()
          this.sendSocketNotification('RESUMED')
        } else {
          this.sendSocketNotification('NOT_RESUMED')
        }
        break
      case 'PAUSE':
        if (this.status == 'ON') {
          this.status = 'OFF'
          this.deactivate()
          this.sendSocketNotification('PAUSED')
        } else {
          this.sendSocketNotification('NOT_PAUSED')
        }
        break
    }
  },

  activate: function() {
    console.log("[MH-Lights] Activating...");
    var light = new Control(this.light_address);
    light.turnOn();
    light.setCustomPattern(assistant_active_pattern, 100)
  },

  deactivate: function() {
    var light = new Control(this.light_address);
    light.turnOff();
    this.status = 'OFF'
  },

  getLightAddress: function() {
    if (this.config.light_address == 'DISCOVER') {
      var disc = new Discovery();
      disc.scan(2000, function(err, devices) {
        console.log(devices);
        this.light_address = devices[0].address;
      });
    } else {
      this.light_address = this.config.light_address;
      console.log("[MH-Lights] light_address = " + this.light_address)
    }
  },
})
