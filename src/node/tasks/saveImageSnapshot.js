import fs from 'fs-extra';
import { sync as rimraf } from 'rimraf';
import { getSnapshotFilename } from './getSnapshotFilename.js';
import { IMAGE_TYPE_ACTUAL } from '../../common/constants.js';

export function saveImageSnapshot(data) {
  const {
    testFile,
    snapshotTitle,
  } = data;
  const filename = getSnapshotFilename(testFile, snapshotTitle);
  const actualFilename = getSnapshotFilename(testFile, snapshotTitle, IMAGE_TYPE_ACTUAL);
  rimraf(filename);

  if (fs.existsSync(actualFilename)) {
    fs.moveSync(actualFilename, filename);
  }

  data.saved = true;
  return data;
}

