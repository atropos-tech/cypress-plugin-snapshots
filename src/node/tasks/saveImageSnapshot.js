import fs from 'fs-extra';
import { sync as rimraf } from 'rimraf';
import { getImageSnapshotFilename } from './getImageSnapshotFilename.js';
import { IMAGE_TYPE_ACTUAL } from '../../common/constants.js';

export function saveImageSnapshot(data) {
  const {
    testFile,
    snapshotTitle,
  } = data;
  const filename = getImageSnapshotFilename(testFile, snapshotTitle);
  const actualFilename = getImageSnapshotFilename(testFile, snapshotTitle, IMAGE_TYPE_ACTUAL);
  rimraf(filename);

  if (fs.existsSync(actualFilename)) {
    fs.moveSync(actualFilename, filename);
  }

  data.saved = true;
  return data;
}

