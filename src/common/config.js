import { merge, cloneDeep, clone } from 'lodash-es';
import { TYPE_JSON } from './dataTypes.js';

export const DEFAULT_SCREENSHOT_CONFIG = Object.freeze({
  blackout: [],
  capture: 'fullPage',
  clip: null,
  padding: null,
  disableTimersAndAnimations: true,
  log: false,
  scale: false,
  timeout: 30000,
});

export const DEFAULT_IMAGE_CONFIG = Object.freeze({
  createDiffImage: true,
  resizeDevicePixelRatio: true,
  threshold: 0.1,
  thresholdType: 'percent', // can be 'percent' or 'pixel'
});

const DEFAULT_CONFIG = Object.freeze({
  autoCleanUp: false,
  autopassNewSnapshots: true,
  diffLines: 3,
  excludeFields: [],
  formatJson: true,
  ignoreExtraArrayItems: false,
  ignoreExtraFields: false,
  imageConfig: clone(DEFAULT_IMAGE_CONFIG),
  normalizeJson: true,
  prettier: true,
  prettierConfig: {
    html: {
      parser: 'html',
      tabWidth: 2,
      endOfLine: 'lf'
    },
  },
  screenshotConfig: clone(DEFAULT_SCREENSHOT_CONFIG),
  updateSnapshots: false,
  backgroundBlend: 'difference',
  name: '',
  retryCount: 0,
  retryDelay: 200,
});

export const CONFIG_KEY = 'cypress-plugin-snapshots';

let config = cloneDeep(DEFAULT_CONFIG);

export function initConfig(initialConfig) {
  if (initialConfig) {
    config = merge(config, initialConfig);
  }
  return config;
}

export function getConfig() {
  return config;
}

export function getImageConfig(options = {}) {
  return Object.keys(DEFAULT_IMAGE_CONFIG)
    .filter((key) => options.imageConfig && options.imageConfig[key] !== undefined)
    .reduce(
      (imageConfig, key) => {
        imageConfig[key] = options.imageConfig[key];
        return imageConfig;
      },
      merge({}, DEFAULT_IMAGE_CONFIG, getConfig().imageConfig)
    );
}


export function getScreenshotConfig(options = {}) {
  const screenshotConfig = Object.keys(DEFAULT_SCREENSHOT_CONFIG)
    .filter((key) => options.screenshotConfig && options.screenshotConfig[key] !== undefined)
    .reduce(
      (currentConfig, key) => {
        currentConfig[key] = options.screenshotConfig[key];
        return currentConfig;
      },
      merge({}, DEFAULT_SCREENSHOT_CONFIG, getConfig().screenshotConfig)
    );

  screenshotConfig.blackout = (screenshotConfig.blackout || []);
  screenshotConfig.blackout.push('.snapshot-diff');
  return screenshotConfig;
}

export function getCustomName(suppliedConfig) {
  const cfg = suppliedConfig || getConfig();
  return cfg.name;
}

export function getCustomSeparator(suppliedConfig) {
  const cfg = suppliedConfig || getConfig();
  return cfg.separator;
}

export function shouldNormalize(dataType, suppliedConfig) {
  const cfg = suppliedConfig && suppliedConfig.normalizeJson !== undefined ?
    suppliedConfig : getConfig();
  return dataType === TYPE_JSON && cfg.normalizeJson;
}

export function getPrettierConfig(dataType, suppliedConfig) {
  const cfg = suppliedConfig && suppliedConfig.prettierConfig ?
    suppliedConfig : getConfig();
  return cfg.prettier && cfg.prettierConfig ? cfg.prettierConfig[dataType] : undefined;
}

