'use strict';
var textHelper = require('./textHelper'),
    storage = require('./storage');

var registerIntentHandlers = function (intentHandlers, skillContext) {

    intentHandlers.AddPersonIntent = function (intent, session, response) {
        var newPersonName = intent.slots.Person.value;
        if (!newPersonName) {
            response.ask('OK. Who do you want to add?', 'Who do you want to add?');
            return;
        }
        storage.loadTasks(session, function (currentTasks) {
            var speechOutput,
                reprompt;
            if (currentTasks.data.tasks[newPersonName] !== undefined) {
                speechOutput = newPersonName + ' has already been added.';

                if (skillContext.needMoreHelp) {
                    response.ask(speechOutput);
                } else {
                    response.tell(speechOutput);
                }
                return;
            }
            speechOutput = newPersonName + ' has been added. ';
            currentTasks.data.persons.push(newPersonName);
            currentTasks.data.tasks[newPersonName] = [];
            if (skillContext.needMoreHelp) {
                if (currentTasks.data.persons.length == 1) {
                    speechOutput += 'You can start creating tasks for ' + newPersonName + '.';
                    reprompt = textHelper.nextHelp;
                } else {
                    speechOutput += 'You can start creating tasks for ' + newPersonName + '.';
                    reprompt = textHelper.nextHelp;
                }
            }
            currentTasks.save(function () {
                if (reprompt) {
                    response.ask(speechOutput, reprompt);
                } else {
                    response.tell(speechOutput);
                }
            });
        });
    };

    intentHandlers.AddTaskIntent = function (intent, session, response) {
        var personName = intent.slots.Person.value,
            task = intent.slots.Task.value;
        if (!personName) {
            response.ask('I could not hear the person\'s name, please can you repeat the name again', 'Please can you repeat the name again.');
            return;
        }
        storage.loadTasks(session, function (currentTasks) {
            var targetPerson,
                speechOutput = '';
            for (var i = 0; i < currentTasks.data.persons.length; i++) {
                if (currentTasks.data.persons[i] === personName) {
                    targetPerson = currentTasks.data.persons[i];
                    break;
                }
            }
            if (!targetPerson) {
                speechOutput = personName + ' has been added. ';
                currentTasks.data.persons.push(personName);
                targetPerson = personName;
                currentTasks.data.tasks[targetPerson] = [];
            }
            currentTasks.data.tasks[targetPerson].push(task);

            speechOutput += ' added task ' + task + ' for ' + targetPerson + '. ';
            currentTasks.save(function () {
                response.tell(speechOutput);
            });
        });
    };

    intentHandlers.ListTasksIntent = function (intent, session, response) {
        var personName = intent.slots.Person.value;
        if (!personName) {
            response.ask('I could not hear the person\'s name, please can you repeat the name again.', 'Please can you repeat the name again.');
            return;
        }
        storage.loadTasks(session, function (currentTasks) {
            var targetPerson,
                speechOutput = '',
                taskCount = 0,
                cardContent = '';
            if (currentTasks.data.persons.length < 1) {
                response.ask('No one has been added yet. You can try adding new people to the list.', 'You can try adding new people to the list.');
                return;
            }
            for (var i = 0; i < currentTasks.data.persons.length; i++) {
                if (currentTasks.data.persons[i] === personName) {
                    targetPerson = currentTasks.data.persons[i];
                    break;
                }
            }
            if (!targetPerson) {
                response.ask(personName + ' is not in the list. You can add new person to the list.', personName + ' is not in the list. You can add new person to the list.');
                return;
            }
			
            currentTasks.data.tasks[targetPerson].forEach(function (task) {
                taskCount += 1;
                speechOutput += 'Task ' + taskCount + ' is ' + task + '. ';
                cardContent += 'No. ' + taskCount + ' - ' + task + '\n';
            });

            speechOutput += 'You can start adding more tasks.';
            response.ask(speechOutput, "Tasks for " + targetPerson, cardContent);
        });
    };

    intentHandlers.RemoveTaskIntent = function (intent, session, response) {
        var personName = intent.slots.Person.value,
            taskNumber = intent.slots.Number,
            taskIndex = parseInt(taskNumber.value);
        if (!personName) {
            response.ask('I could not recognise the person\'s name. Can you repeat the name again?', 'Can you repeat the name again?');
            return;
        }
        storage.loadTasks(session, function (currentTasks) {
            var targetPerson,
                taskNumber,
                speechOutput = '';
            if (currentTasks.data.persons.length < 1) {
                response.ask('No one has been added yet. You can try adding new people to the list.', 'You can try adding new people to the list.');
                return;
            }
            for (var i = 0; i < currentTasks.data.persons.length; i++) {
                if (currentTasks.data.persons[i] === personName) {
                    targetPerson = currentTasks.data.persons[i];
                    break;
                }
            }
            if (!targetPerson) {
                response.ask(personName + ' is not in the list. You can try adding new people to the list.', personName + ' is not in the list. You can try adding new people to the list.');
                return;
            }
            if (taskIndex < 1 || currentTasks.data.tasks[targetPerson].length < taskIndex) {
                response.ask('I could not find task ' + taskIndex +' for ' + targetPerson + '. Can you try again?');
                return;
            }
            currentTasks.data.tasks[targetPerson].splice(taskIndex - 1, 1);
            speechOutput += 'Deleted task ' + taskIndex + ' for ' + targetPerson + '. ';
            currentTasks.save(function () {
                response.ask(speechOutput+' You can start creating a new task.');
            });
        });
    };

    intentHandlers.ClearTasksIntent = function (intent, session, response) {
        var personName = intent.slots.Person.value;
        if (!personName) {
            response.ask('I could not hear the person\'s name, please can you repeat the name again.', 'Please can you repeat the name again.');
            return;
        }
        storage.loadTasks(session, function (currentTasks) {
            var targetPerson,
                speechOutput = '',
                taskCount = 0,
                cardContent = '';
            if (currentTasks.data.persons.length < 1) {
                response.ask('No one has been added yet. You can try adding new people to the list.', 'You can try adding new people to the list.');
                return;
            }
            for (var i = 0; i < currentTasks.data.persons.length; i++) {
                if (currentTasks.data.persons[i] === personName) {
                    targetPerson = currentTasks.data.persons[i];
                    break;
                }
            }
            if (!targetPerson) {
                response.ask(personName + ' is not in the list. You can add new people to the list or you can start creating tasks.', personName + ' is not in the list. You can add new people to the list or you can start creating tasks.');
                return;
            }
            currentTasks.data.tasks[targetPerson] = [];
            speechOutput += 'Tasks deleted for ' + targetPerson + '.';
            currentTasks.save(function () {
               response.ask(speechOutput+' You can start adding new tasks.');
            });
        });
    };


    intentHandlers.ResetIntent = function (intent, session, response) {
        storage.loadTasks(session, function (currentTasks) {
            if (currentTasks.data.persons.length === 0) {

                response.ask('The name list and all assigned tasks are deleted. Now you can add new people.',
                    'Who would you like to add?');
                return;
            }
            currentTasks.data.persons = [];
            currentTasks.data.tasks = {};
            currentTasks.save(function () {
                var speechOutput = 'All tasks are cleared. ';
                if (skillContext.needMoreHelp) {
                    speechOutput += 'You can add new people now and start creating tasks for them.';
                    var repromptText = 'You can add new people now and start creating tasks for them.';
                    response.ask(speechOutput, repromptText);
                } else {
                    response.tell(speechOutput);
                }
            });
        });
    };

    intentHandlers['AMAZON.HelpIntent'] = function (intent, session, response) {
        var speechOutput = textHelper.completeHelp;
        if (skillContext.needMoreHelp) {
            response.ask(textHelper.completeHelp + ' Can you let me how can I help you?', 'Can you let me how can I help you?');
        } else {
            response.tell(textHelper.completeHelp);
        }
    };

    intentHandlers['AMAZON.CancelIntent'] = function (intent, session, response) {
        if (skillContext.needMoreHelp) {
            response.tell('Okay. Whenever you\'re ready, you can start assigning tasks to people.');
        } else {
            response.tell('');
        }
    };

    intentHandlers['AMAZON.StopIntent'] = function (intent, session, response) {
        if (skillContext.needMoreHelp) {
            //response.tell('Okay. Whenever you\'re ready, you can start assigning tasks to the people in your family.');
            response.tell('Okay. Whenever you\'re ready, you can start assigning tasks to people.');
        } else {
            response.tell('');
        }
    };
};

exports.register = registerIntentHandlers;
