/* globals Cypress, before, after, cy */
/* eslint-env browser */

// Removes unused snapshots from snapshot file
function cleanUpSnapshots() {

  // TODO this should be a task!

  // const config = getConfig();
  // if (!config.autoCleanUp) {
  //   return;
  // }

  // getSpec().then((spec) => {
  //   const filename = getTextSnapshotFilename(spec.relative);
  //   cy.readFile(filename, NO_LOG).then((content) => {
  //     if (content) {
  //       const snapshot = JSON.parse(content);
  //       const keys = Object.keys(snapshot);

  //       const cleanSnapshot = keys
  //         .filter(snapshotTitleIsUsed)
  //         .reduce((result, key) => {
  //           result[key] = snapshot[key];
  //           return result;
  //         }, {});

  //       cy.writeFile(filename,
  //         formatNormalizedJson(cleanSnapshot),
  //         NO_LOG);
  //     }
  //   });
  // });
}

module.exports = cleanUpSnapshots;
