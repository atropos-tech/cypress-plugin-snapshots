import { merge, cloneDeep } from 'lodash-es';
import { sync as rimraf } from 'rimraf';
import path from 'path';
import { getConfig } from '../../common/config.js';
import { getImageSnapshotFilename } from './getImageSnapshotFilename.js';
import { getImageData } from '../../common/getImageData.js';
import { saveImageSnapshot } from './saveImageSnapshot.js';
import { getImageObject, compareImages, moveActualImageToSnapshotsDirectory, createDiffObject } from './imageSnapshots.js';
import { resizeImage } from './resizeImage.js';
import { IMAGE_TYPE_DIFF, IMAGE_TYPE_ACTUAL } from '../../common/constants.js';

function getImageDataWithPath(props, devicePixelRatio) {
  return {
    ...getImageData(props, devicePixelRatio),
    relativePath: (props.path) ? path.relative(process.cwd(), props.path) : '',
  } 
}

export async function matchImageSnapshot(data = {}) {
  const {
    commandName,
    dataType,
    image,
    options,
    snapshotTitle,
    subject,
    testFile,
  } = data;
  if (!image) {
    throw new Error(`'image' not defined`);
  } else if (!image.devicePixelRatio) {
    throw new Error(`'image.devicePixelRatio' not defined`);
  }

  const actualFilename = getImageSnapshotFilename(testFile, snapshotTitle, IMAGE_TYPE_ACTUAL);
  const diffFilename = getImageSnapshotFilename(testFile, snapshotTitle, IMAGE_TYPE_DIFF);
  const config = merge({}, cloneDeep(getConfig()), options);
  const snapshotFile = getImageSnapshotFilename(testFile, snapshotTitle);
  const resized = options && options.resizeDevicePixelRatio && image.devicePixelRatio !== 1;
  if (resized) {
    await resizeImage(image.path, actualFilename, image.devicePixelRatio);
  }
  if (resized === false) {
    moveActualImageToSnapshotsDirectory(data);
  } else {
    image.path = actualFilename;
  }

  const expected = getImageObject(snapshotFile);
  const exists = expected !== false;
  const autoPassed = (config.autopassNewSnapshots && expected === false);
  const actual = exists || resized ? getImageObject(image.path, true) : image;
  const passed = expected && compareImages(expected, actual, diffFilename, options);

  actual.resized = resized !== false;

  let updated = false;

  if ((config.updateSnapshots && !passed) || autoPassed) {
    saveImageSnapshot({ testFile, snapshotTitle, actual });
    updated = true;
  }

  if (passed && actual && actual.path) {
    rimraf(actual.path);
  }

  const diff = passed || autoPassed || !options.createDiffImage ?
    undefined : createDiffObject(diffFilename);

  const result = {
    actual: getImageDataWithPath(actual),
    commandName,
    dataType,
    diff,
    exists,
    expected: getImageDataWithPath(expected),
    passed: passed || autoPassed,
    snapshotFile: path.relative(process.cwd(), snapshotFile),
    snapshotTitle,
    subject,
    updated,
    isImage: true,
  };

  return result;
}

