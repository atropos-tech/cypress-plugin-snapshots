
import { initConfig, CONFIG_KEY } from './src/common/config.js';
import CYPRESS_TASKS from './src/node/tasks/index.js';

/**
 * Initializes the plugin:
 * - registers tasks for `toMatchSnapshot` and `toMatchImageSnapshot`.
 * - Make config accessible via `Cypress.env`.
 * @param {Function} on - Method to register tasks
 * @param {Object} globalConfig - Object containing global Cypress config
 */
export function initPlugin(on, globalConfig = {
}) {
  const config = initConfig(globalConfig.env[CONFIG_KEY]);

  // Adding sub objects/keys to `Cypress.env` that don't exist in `cypress.json` doesn't work.
  // That's why the config is stringified and parsed again in `src/utils/commands/getConfig.js#fixConfig`.
  globalConfig.env[CONFIG_KEY] = JSON.stringify(config);

  on('before:browser:launch', (browser = {}, launchOptions) => {
    const args = Array.isArray(launchOptions) ? launchOptions : launchOptions.args;

    if (browser.name === 'chrome') {
      args.push('--font-render-hinting=medium');
      args.push('--enable-font-antialiasing');
      args.push('--disable-gpu');
    }

    return launchOptions;
  });

  on('task', CYPRESS_TASKS);
}
