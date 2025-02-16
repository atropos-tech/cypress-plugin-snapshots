import { createHash } from 'crypto';
import { PNG } from 'pngjs';
import fs from 'fs-extra';
import pixelmatch  from 'pixelmatch';
import { merge } from 'lodash-es';
import { sync as rimraf } from 'rimraf';
import path from 'path';
import { getImageSnapshotFilename } from './getImageSnapshotFilename.js';
import { getImageData } from '../../common/getImageData.js';
import { IMAGE_TYPE_ACTUAL } from '../../common/constants.js';
import { DEFAULT_IMAGE_CONFIG  } from '../../common/config.js';

function getImageDataWithPath(props, devicePixelRatio) {
  return {
    ...getImageData(props, devicePixelRatio),
    relativePath: (props.path) ? path.relative(process.cwd(), props.path) : '',
  } 
}

export function moveActualImageToSnapshotsDirectory({image, snapshotTitle, testFile} = {}) {
  if (image && image.path) {
    const filename = getImageSnapshotFilename(testFile, snapshotTitle, IMAGE_TYPE_ACTUAL);
    rimraf(filename);
    if (fs.existsSync(image.path)) {
      fs.moveSync(image.path, filename);
    }
    image.path = filename;
  }
}

export function createDiffObject(filename) {
  const imageObject = getImageObject(filename, false);
  return getImageDataWithPath(imageObject);
}

/**
 * Create object containing `image`, `path`, `width`, `height` and `hash`
 * property based on an image file.
 *
 * Returns false if file does not exist.
 *
 * @param {string} filename - Path to image to read
 * @param {boolean} addHash - Add hash to result
 */
export function getImageObject(filename, addHash = true) {
  const exists = fs.existsSync(filename);
  const size = exists ? fs.statSync(filename).size : 0;

  if (size > 0) {
    const image = PNG.sync.read(fs.readFileSync(filename));
    const hash = addHash !== false ?
      createHash('sha1').update(image.data).digest('base64') : undefined;

    return {
      path: filename,
      image,
      hash,
      height: image.height,
      width: image.width,
    };
  }

  return false;
}

function createCompareCanvas(width, height, source) {
  const canvas = new PNG({
    width,
    height,
    colorType: 6,
    bgColor: {
      red: 0,
      green: 0,
      blue: 0,
      alpha: 0,
    }
  });
  PNG.bitblt(source, canvas, 0, 0, source.width, source.height, 0, 0);
  return canvas;
}

/**
 * Create a canvas that can fit both `expected` and `actual` image.
 * Makes it easier to compare images (and also nicer diff result).
 * @param {*} expected
 * @param {*} actual
 */
function makeImagesEqualSize(expected, actual) {
  const height = Math.max(expected.height, actual.height);
  const width = Math.max(expected.width, actual.width);
  actual.image = createCompareCanvas(width, height, actual.image);
  expected.image = createCompareCanvas(width, height, expected.image);
}

function compareImageSizes(expected, actual) {
  return expected.width === actual.width &&
    actual.height === expected.height;
}

export function compareImages(expected, actual, diffFilename, config) {
  let passed = false;
  rimraf(diffFilename);

  if (actual !== false) {
    const hashMatches = expected.hash === actual.hash;
    if (hashMatches) {
      return true;
    }

    const sizeMatch = compareImageSizes(expected, actual);
    if (!sizeMatch) {
      makeImagesEqualSize(expected, actual);
    }

    const imageConfig = merge({}, DEFAULT_IMAGE_CONFIG, config);
    const pixelmatchConfig = {
      threshold: 0.01,
    };

    const imageWidth = actual.image.width;
    const imageHeight = actual.image.height;

    const diffImage = config.createDiffImage ? new PNG({
      height: imageHeight,
      width: imageWidth,
    }) : null;

    const totalPixels = imageWidth * imageHeight;
    const diffPixelCount = pixelmatch(
      actual.image.data,
      expected.image.data,
      diffImage ? diffImage.data : null,
      imageWidth,
      imageHeight,
      pixelmatchConfig
    );

    if (imageConfig.thresholdType === 'pixel') {
      passed = diffPixelCount <= imageConfig.threshold;
    } else if (imageConfig.thresholdType === 'percent') {
      const diffRatio = diffPixelCount / totalPixels;
      passed = diffRatio <= imageConfig.threshold;
    } else {
      throw new Error(`Unknown imageConfig.thresholdType: ${imageConfig.thresholdType}. `+
        `Valid options are "pixel" or "percent".`);
    }

    if (!passed && diffImage) {
      // Set filter type to Paeth to avoid expensive auto scanline filter detection
      // For more information see https://www.w3.org/TR/PNG-Filters.html
      const pngBuffer = PNG.sync.write(diffImage, {
        filterType: 4
      });
      fs.writeFileSync(diffFilename, pngBuffer);
    }
  }

  return passed;
}

export function saveImageSnapshot(data) {
  rimraf(data.expected.path);
  rimraf(data.diff.path);
  fs.moveSync(data.actual.path, data.expected.path);
}

