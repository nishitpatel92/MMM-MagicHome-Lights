//
// Module : MMM-MagicHome-Lights
//

Module.register("MMM-MagicHome-Lights", {
  defaults: {
    autostart: false,
    autorestart: true,
    light_address: "DISCOVER",

    assistant_active_pattern: [
      {
        red: 0,
        blue: 30,
        green: 30
      },
      {
        red: 0,
        blue: 130,
        green: 130
      }
    ],

    hotword_active_pattern: [
      {
        red: 220,
        blue: 105,
        green: 255
      },
      {
        red: 230,
        blue: 210,
        green: 255
      }
    ],

    notifications: {
      AL_PAUSE: "ASSISTANT_STANDBY",
      AL_RESUME: "ASSISTANT_ACTIVATE",
      HL_PAUSE: "NA",
      HL_RESUME: "NA",
      SLEEPING: "MH_LIGTHS_SLEEPING",
      ERROR: "MH_LIGTHS_ERROR"
    },
    onDetected: {
      notification: payload => {
        return "HOTWORD_DETECTED";
      },
      payload: payload => {
        return payload;
      }
    }
  },

  notificationReceived: function(notification, payload, sender) {
    console.log("[MH-Lights] Received notification - " + notification);
    switch (notification) {
      case "ALL_MODULES_STARTED":
        if (this.config.autostart == true) {
          this.sendSocketNotification("RESUME");
        }
        break;
      case this.config.notifications.AL_RESUME:
        this.sendSocketNotification("AL_RESUME");
        break;
      case this.config.notifications.AL_PAUSE:
        this.sendSocketNotification("AL_PAUSE");
        break;
      case this.config.notifications.HL_RESUME:
        this.sendSocketNotification("HL_RESUME");
        break;
      case this.config.notifications.HL_PAUSE:
        this.sendSocketNotification("HL_PAUSE");
        break;
    }
  },

  socketNotificationReceived: function(notification, payload) {
    switch (notification) {
      case "INITIALIZED":
        console.log("[MH-Lights] Init.");
        //do nothing
        break;
      case "NOT_PAUSED":
        //this.sendNotification(this.config.notifications.RESUME)
        break;
      case "NOT_RESUMED":
        //this.sendNotification(this.config.notifications.SLEEPING)
        break;
      case "RESUMED":
        console.log("[MH-Lights] Resumed.");
        //this.sendNotification(this.config.notifications.LISTENING)
        break;
      case "PAUSED":
        //this.sendNotification(this.config.notifications.SLEEPING)
        break;
      case "ERROR":
        //this.sendNotification(this.config.notifications.ERROR, payload)
        console.log("[MH-Lights] Error: ", payload);
        break;
    }
  },

  start: function() {
    console.log("[MH-Lights] Module started");
    this.isInitialized = 0;
    this.config = this.configAssignment({}, this.defaults, this.config);
    this.sendSocketNotification("INIT", this.config);
  },

  configAssignment: function(result) {
    var stack = Array.prototype.slice.call(arguments, 1);
    var item;
    var key;
    while (stack.length) {
      item = stack.shift();
      for (key in item) {
        if (item.hasOwnProperty(key)) {
          if (
            typeof result[key] === "object" &&
            result[key] &&
            Object.prototype.toString.call(result[key]) !== "[object Array]"
          ) {
            if (typeof item[key] === "object" && item[key] !== null) {
              result[key] = this.configAssignment({}, result[key], item[key]);
            } else {
              result[key] = item[key];
            }
          } else {
            result[key] = item[key];
          }
        }
      }
    }
    return result;
  }
});
