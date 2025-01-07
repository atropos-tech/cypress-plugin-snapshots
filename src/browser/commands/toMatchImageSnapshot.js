import { MATCH_IMAGE } from '../../common/taskNames';
import getTaskData from './getTaskData';
import logMessage from './logMessage';
import { NO_LOG } from '../../common/constants';
import { COMMAND_MATCH_IMAGE_SNAPSHOT as commandName } from './commandNames';
import { getImageData } from '../../common/getImageData';
import {
 getImageConfig, getScreenshotConfig, getCustomName, getCustomSeparator 
} from '../../common/config';

function afterScreenshot(taskData) {
  return ($el, props) => {
    // See this url for contents of `props`:
    // https://docs.cypress.io/api/commands/screenshot.html#Get-screenshot-info-from-the-onAfterScreenshot-callback
    const win = $el.get(0).ownerDocument.defaultView;
    taskData.image = getImageData(props, win.devicePixelRatio);
    taskData.isImage = true;
    delete taskData.subject;
  };
}

async function toMatchImageSnapshot(subject, commandOptions, isRetry = false) {
  const options = getImageConfig(commandOptions);
  const customName = getCustomName(commandOptions);
  const customSeparator = getCustomSeparator(commandOptions);

  const taskData = await getTaskData({
    commandName,
    options,
    customName,
    customSeparator,
    subject,
    isRetry,
  });

  const screenShotConfig = getScreenshotConfig(commandOptions);
  const afterScreenshotFn = afterScreenshot(taskData);
  if (screenShotConfig.onAfterScreenshot) {
    const afterScreenshotCallback = screenShotConfig.onAfterScreenshot;
    screenShotConfig.onAfterScreenshot = (...args) => {
      afterScreenshotFn.apply(this, args);
      afterScreenshotCallback.apply(this, args);
    }
  } else {
    screenShotConfig.onAfterScreenshot = afterScreenshotFn;
  }

  return cy.wrap(subject, NO_LOG)
    .screenshot(taskData.snapshotTitle, screenShotConfig)
    .then(() => cy.task(
        MATCH_IMAGE,
        taskData,
        NO_LOG
      ).then((result) => {
        if (!result.passed && commandOptions.retryCount > 0) {
          return cy.wait(commandOptions.retryDelay).then(() => {
            const newCommandOptions = {
              ...commandOptions,
              retryCount: commandOptions.retryCount - 1,
            };
            return toMatchImageSnapshot(subject, newCommandOptions, true);
          });
        }
        return logMessage(result);
      })
    );
}

export default toMatchImageSnapshot;
