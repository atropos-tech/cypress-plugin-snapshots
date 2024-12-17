const {
  merge,
  cloneDeep
} = require('lodash');
const applyReplace = require('./applyReplace');
const {
  createDiff,
  formatDiff,
  getSnapshot,
  subjectToSnapshot,
  updateSnapshot,
} = require('./textSnapshots');
const getSnapshotFilename = require('./getSnapshotFilename');
const keepKeysFromExpected = require('./keepKeysFromExpected');
const {
  getConfig
} = require('../../common/config');

function matchTextSnapshot({
  commandName,
  dataType,
  options,
  snapshotTitle,
  subject,
  testFile,
} = {}) {
  const config = merge({}, cloneDeep(getConfig()), options);
  const snapshotFile = getSnapshotFilename(testFile);
  const expectedRaw = getSnapshot(snapshotFile, snapshotTitle, dataType);
  let expected = applyReplace(expectedRaw, config.replace);
  const actual = keepKeysFromExpected(subjectToSnapshot(subject, dataType, config), expected, config);

  const exists = expected !== false;

  const autoPassed = (config.autopassNewSnapshots && expected === false);
  const passed = (expected && formatDiff(expected) === formatDiff(actual));
  const diff = createDiff(expected, actual, snapshotTitle);

  let updated = false;

  if ((config.updateSnapshots && !passed) || expected === false) {
    updateSnapshot(snapshotFile, snapshotTitle, actual, dataType);
    updated = true;
  }

  if (autoPassed) {
    expected = actual;
  }

  const result = {
    actual,
    commandName,
    dataType,
    diff,
    exists,
    expected,
    passed: passed || autoPassed,
    snapshotFile,
    snapshotTitle,
    subject,
    updated,
  };

  return result;
}

module.exports = matchTextSnapshot;
