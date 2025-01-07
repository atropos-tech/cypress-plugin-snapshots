import getTestTitle from './getTestTitle';
import { getSnapshotTitle } from './snapshotTitles';
import getSpec from './getSpec';
import {
 getTestForTask, getSubject, isHtml 
} from './utils';
import { COMMAND_MATCH_IMAGE_SNAPSHOT } from './commandNames';
import { TYPE_HTML, TYPE_JSON, TYPE_IMAGE } from '../../common/dataTypes';

function isImage(commandName) {
  return commandName === COMMAND_MATCH_IMAGE_SNAPSHOT;
}

function getDataType({ commandName, subject }) {
  if (isImage(commandName)) {
    return TYPE_IMAGE;
  }

  return isHtml(subject) ? TYPE_HTML : TYPE_JSON;
}

async function getTaskData({
  commandName,
  options,
  customName,
  customSeparator,
  subject: testSubject,
  isRetry,
} = {}) {
  const subjectIsImage = isImage(commandName);
  const test = getTestForTask();
  const testTitle = getTestTitle(test);
  const spec = await getSpec();
  const testFile = spec.absolute;
  const snapshotTitle = getSnapshotTitle(
    test,
    customName,
    customSeparator,
    subjectIsImage,
    isRetry
  );
  const subject = subjectIsImage ? testSubject : getSubject(testSubject);
  const dataType = getDataType({ commandName, subject: testSubject });

  return {
    commandName,
    dataType,
    options,
    snapshotTitle,
    subject,
    testFile,
    testTitle,
  };
}

export default getTaskData;
