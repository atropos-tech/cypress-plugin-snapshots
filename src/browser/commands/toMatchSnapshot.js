const { MATCH_TEXT } = require('../../node/tasks/taskNames');
const getTaskData = require('./getTaskData');
const logMessage = require('./logMessage');
const { NO_LOG } = require('../../common/constants');
const { COMMAND_MATCH_SNAPSHOT: commandName } = require('./commandNames');

function toMatchSnapshot(subject, options, isRetry = false) {
  return getTaskData({
      commandName,
      options,
      subject,
      isRetry,
    }).then(taskData => cy.task(
        MATCH_TEXT,
        taskData,
        NO_LOG
      ).then((result) => {
        if (!result.passed && options.retryCount > 0) {
          return cy.wait(options.retryDelay).then(() => {
            const newOptions = {
              ...options,
              retryCount: options.retryCount - 1,
            };
            return toMatchSnapshot(subject, newOptions, true);
          });
        }
        return logMessage(result);
      })
    );
}

module.exports = toMatchSnapshot;