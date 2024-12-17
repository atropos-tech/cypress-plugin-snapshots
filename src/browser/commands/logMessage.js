import { Base64 } from 'js-base64';
import { URL_PREFIX  } from '../../common/constants';
import { TYPE_IMAGE } from '../../common/dataTypes';

function getErrorMessage(result) {
  if (result.dataType === TYPE_IMAGE) {
    return `Snapshot images do not match.`;
  }

  return `Snapshots do not match:\n${result.diff}`;
}

function cleanupImage(image) {
  if (image) {
    image.path = image.relativePath;
    delete image.relativePath;
  }
}

function getLogMessage(result) {
  const linkResult = window.structuredClone(result);
  if (linkResult.isImage) {
    cleanupImage(linkResult.actual);
    cleanupImage(linkResult.expected);
    cleanupImage(linkResult.diff);
  }

  const args = Base64.encode(JSON.stringify(linkResult));
  const expectedMessage = result.expected ? 'Snapshots match' : 'Snapshot created, autopassed';
  const passedMessage = result.updated ? 'Snapshot updated' : expectedMessage;
  const message = result.passed || result.updated ?
    `[${passedMessage}](${URL_PREFIX}${args})` :
    `[compare snapshot](${URL_PREFIX}${args})`;

  return message;
}

function logMessage(result) {
  const { subject } = result;
  const message = getLogMessage(result);
  const log = Cypress.log({
    $el: subject,
    name: result.commandName,
    displayName: 'snapshot',
    message,
    consoleProps: () => result,
  });

  if (!result.passed) {
    const updated = result.updated === true;

    if (updated) {
      log.set('state', 'pending');
      log.set('ended', true);
    } else {
      log.set('state', 'failed');

      const errorMessage = getErrorMessage(result);
      throw new Error(errorMessage);
    }
  }

  return subject;
}

export default logMessage;
