'use strict';

var textHelper = (function () {
    return {
        completeHelp: 'Here are some things you can say,'
        + ' add Dave.'
        + ' tell Dave to wash the dishes.'
        + ' what are the tasks for Dave.'
        + ' remove wash the dishes task for Dave.'
        + ' remove tasks for Dave.'
        + ' reset all.'
        + ' and exit.',

	    nextHelp: 'You can give a person a task, add a person or view the list of tasks for a person.'
	};
})();
module.exports = textHelper;
