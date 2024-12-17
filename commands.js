import { merge } from 'lodash';
import { initUi } from './src/browser/ui';
import commands from './src/browser/commands';
import cleanUpSnapshots from './src/browser/commands/cleanupSnapshots';
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
  // Initialize config by getting it once
  getConfig();

  // Inject CSS & JavaScript
  before(() => {
    initUi();
  });

  function closeSnapshotModal() {
    try {
      if (window.top.closeSnapshotModal) {
        window.top.closeSnapshotModal();
      }
    } catch(ex) {
      window.console.error(ex);
    }
  }

  function clearFileCache() {
    Cypress.__readFileCache__ = {};
  }

  // Close snapshot modal and reset image files cache before all test restart
  Cypress.on('window:before:unload', () => {
    closeSnapshotModal()
    clearFileCache()
  });

  // Clean up unused snapshots
  after(() => {
    cleanUpSnapshots();
  });

  // Add commands
  Object.keys(commands).forEach(key => addCommand(key, commands[key]));
}
