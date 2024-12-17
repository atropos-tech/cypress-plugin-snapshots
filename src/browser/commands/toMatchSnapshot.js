import { MATCH_TEXT } from '../../common/taskNames';
import getTaskData from './getTaskData';
import logMessage from './logMessage';
import { NO_LOG } from '../../common/constants';
import { COMMAND_MATCH_SNAPSHOT as commandName } from './commandNames';

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

export default toMatchSnapshot;
