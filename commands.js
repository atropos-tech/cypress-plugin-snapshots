/* globals Cypress, before, after, cy */
/* eslint-env browser */
const {
  merge,
  cloneDeep
} = require('lodash');
const { initUi } = require('./src/node/ui');
const commands = require('./src/browser/commands/index');
const cleanUpSnapshots = require('./src/browser/commands/cleanupSnapshots');
const getConfig = require('./src/browser/commands/getConfig');
const { NO_LOG } = require('./src/common/constants');

function addCommand(commandName, method) {
  Cypress.Commands.add(commandName, {
    prevSubject: true
  }, (commandSubject, taskOptions) => {
    if (!commandSubject) {
      return commandSubject;
    }

    const options = merge({}, cloneDeep(getConfig()), taskOptions);
    return cy.wrap(commandSubject, NO_LOG)
      .then((subject) => method(subject, options));
  });
}

function initCommands() {
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

module.exports = {
  initCommands,
};
