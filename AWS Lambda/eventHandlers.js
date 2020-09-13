'use strict';
var storage = require('./storage'),
    textHelper = require('./textHelper');

var registerEventHandlers = function (eventHandlers, skillContext) {
    eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {

        skillContext.needMoreHelp = false;
    };

    // The event handler will open at launch //
	
    eventHandlers.onLaunch = function (launchRequest, session, response) {
        storage.loadTasks(session, function (currentTasks) {
            var speechOutput = '',
                reprompt;
            if (currentTasks.data.persons.length === 0) {
                speechOutput += 'I am your Care Manager. Let\'s start by adding people. Who would you like to add first?';
                reprompt = "Please tell me your first person.";
            } else if (currentTasks.isEmptyTaskList()) {
                speechOutput += 'Care Manager, you have ' + currentTasks.data.persons.length;
                if (currentTasks.data.persons.length > 1) {
                    speechOutput += ' people';
                } else {
                    speechOutput += ' person';
                }
                speechOutput += ' defined. You can add a task for a person or add another new person to the list. What would you like to ?';
            } else {
                speechOutput += 'I am your Care Manager. Now you can start creating tasks for people or you can add more new people to the list.';
                reprompt = textHelper.nextHelp;
            }
            response.ask(speechOutput, reprompt);
        });
    };
};
exports.register = registerEventHandlers;
