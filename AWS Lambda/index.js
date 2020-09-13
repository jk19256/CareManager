'use strict';
var DayManager = require('./dayManager');

// Entry point to the skill//

exports.handler = function(event, context) {
    var dayManager = new DayManager();
    dayManager.execute(event, context);
};
