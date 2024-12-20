/* eslint-env browser */
const { CONFIG_KEY } = require('../common/config');

const {
  GET_FILE,
} = require('../common/taskNames');

const {
  PATH_CSS,
  PATH_DIFF_CSS,
  PATH_DIFF_JS,
  PATH_JS,
  PATH_BASE64_JS,
} = require('../common/paths');
const { NO_LOG } = require('../common/constants');

const FILE_CACHE = {};

function readFile(fileType) {
  if (!FILE_CACHE[fileType]) {
    FILE_CACHE[fileType] = cy.task(GET_FILE, fileType, NO_LOG);
  }
  return FILE_CACHE[fileType];
}

function initUi() {
  const $head = Cypress.$(window.parent.window.document.head);
  const config = Cypress.env(CONFIG_KEY);

  if ($head.find('#cypress-plugin-snapshot').length > 0) {
    return;
  }

  readFile(PATH_DIFF_CSS).then((content) => {
    $head.append(`<style>${content}</style>`);
  });

  $head.append(`<style>
  .snapshot-image--diff .snapshot-image__wrapper {
    background-blend-mode: ${config.backgroundBlend ? config.backgroundBlend : 'difference'}
  }
  </style>`);

  readFile(PATH_BASE64_JS).then((content) => {
    $head.append(`<script>${content}</script>`);
  });

  readFile(PATH_DIFF_JS).then((content) => {
    $head.append(`<script>${content}</script>`);
  });

  readFile(PATH_CSS).then((content) => {
    $head.append(`<style id="cypress-plugin-snapshot">${content}</style>`);
  });

  readFile(PATH_JS).then((content) => {
    $head.append(`<script>${content}</script>`);
  });
}

module.exports = {
  initUi,
};
