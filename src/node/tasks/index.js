const {
  MATCH_IMAGE,
  MATCH_TEXT
} = require('../../common/taskNames');
const matchImageSnapshot = require('./matchImageSnapshot');
const matchTextSnapshot = require('./matchTextSnapshot');

module.exports = {
  [MATCH_IMAGE]: matchImageSnapshot,
  [MATCH_TEXT]: matchTextSnapshot,
}
