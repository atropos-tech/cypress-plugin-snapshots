import { merge } from 'lodash-es';
import { updateSnapshot } from './textSnapshots.js';

export function saveTextSnapshot(data) {
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

