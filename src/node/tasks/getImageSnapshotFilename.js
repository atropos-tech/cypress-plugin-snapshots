import path from 'path';
import sanitizeFilename from 'sanitize-filename';
import { DIR_IMAGE_SNAPSHOTS } from '../../common/constants.js';

export function getImageSnapshotFilename(testFile, snapshotTitle, type = '') {
  const dir = path.join(path.dirname(testFile), DIR_IMAGE_SNAPSHOTS);
  const fileType = type ? `.${type}` : '';
  const filename = sanitizeFilename(`${snapshotTitle}${fileType}.png`);
  return path.join(dir, filename);
}
