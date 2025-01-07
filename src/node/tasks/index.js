import { MATCH_TEXT, MATCH_IMAGE } from '../../common/taskNames.js';
import { matchImageSnapshot } from './matchImageSnapshot.js';
import { matchTextSnapshot } from './matchTextSnapshot.js';

export default {
  [MATCH_IMAGE]: matchImageSnapshot,
  [MATCH_TEXT]: matchTextSnapshot,
}
