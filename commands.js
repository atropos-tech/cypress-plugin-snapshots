import { merge } from 'lodash-es';
import commands from './src/browser/commands';
import getConfig from './src/browser/commands/getConfig';
import { NO_LOG } from './src/common/constants';

function addCommand(commandName, method) {
  Cypress.Commands.add(commandName, {
    prevSubject: true
  }, (commandSubject, taskOptions) => {
    if (!commandSubject) {
      return commandSubject;
    }

    const options = merge({}, window.structuredClone(getConfig()), taskOptions);
    return cy.wrap(commandSubject, NO_LOG)
      .then((subject) => method(subject, options));
  });
}

export function initCommands() {
  Object.keys(commands).forEach(key => addCommand(key, commands[key]));
}
