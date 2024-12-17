const { merge } = require('lodash');
const { updateSnapshot } = require('./textSnapshots');

function saveTextSnapshot(data) {
  const {
    snapshotFile,
    snapshotTitle,
    actual,
    dataType,
  } = data;
  updateSnapshot(snapshotFile, snapshotTitle, actual, dataType);
  return merge({}, data, {
    saved: true
  });
}

module.exports = saveTextSnapshot;
