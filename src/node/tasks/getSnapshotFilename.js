import path from 'path';
import { DIR_SNAPSHOTS } from '../../common/constants.js';

export function getSnapshotFilename(testFile) {
  const dir = path.join(path.dirname(testFile), DIR_SNAPSHOTS);
  const filename = `${path.basename(testFile)}.snap`;
  return path.join(dir, filename);
}

