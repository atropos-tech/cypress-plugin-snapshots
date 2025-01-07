import path from 'path';
import fs from 'fs-extra';
import unidiff from 'unidiff';
import prettier from 'prettier';
import { TYPE_JSON } from '../../common/dataTypes.js';
import { getConfig, shouldNormalize, getPrettierConfig } from '../../common/config.js';
import { removeExcludedFields } from './removeExcludedFields.js';
import { formatJson, normalizeObject } from '../../common/json.js';

export function subjectToSnapshot(subject, dataType = TYPE_JSON, config = {}) {
  let result = subject;

  if (typeof subject === 'object' && shouldNormalize(dataType, config)) {
    result = normalizeObject(subject);
  }

  if (dataType === TYPE_JSON && config && config.excludeFields) {
    result = removeExcludedFields(result, config.excludeFields);
  }

  const prettierConfig = getPrettierConfig(dataType, config);
  if (prettierConfig) {
    try {
      if (typeof result === 'object') {
        result = formatJson(result, undefined, 2);
      }

      result = prettier.format(result.trim(), prettierConfig).trim();
    } catch(err) {
      throw new Error(`Cannot format subject: ${result}`);
    }
  } else if(dataType === TYPE_JSON && config.formatJson) {
    result = formatJson(result);
  }

  return result;
}

export function formatDiff(subject) {
  if (typeof subject === 'object') {
    return formatJson(subject);
  }
  return String(subject || '');
}

export function createDiff(expected, actual, snapshotTitle) {
  return unidiff.diffAsText(formatDiff(expected), formatDiff(actual), {
    aname: snapshotTitle,
    bname: snapshotTitle,
    context: getConfig().diffLines,
  });
}

export function getSnapshot(filename, snapshotTitle, dataType = TYPE_JSON) {
  fs.ensureDirSync(path.dirname(filename));

  if (fs.existsSync(filename)) {
    const snapshots = readFile(filename);
    if (snapshots[snapshotTitle]) {
      return subjectToSnapshot(snapshots[snapshotTitle], dataType);
    }
  } else {
    fs.writeFileSync(filename, '{}');
  }

  return false;
}

function readFile(filename) {
  if (fs.existsSync(filename)) {
    let content;
    try {
      delete require.cache[filename];
      content = require(filename); // eslint-disable-line import/no-dynamic-require
    } catch(ex) {
       
      console.warn(`Cannot read snapshot file "${filename}" as javascript, falling back to JSON parser:`, ex);
      const fileContents = fs.readFileSync(filename, 'utf8');

      if (!fileContents || !fileContents.trim() || fileContents.trim().slice(0,1) !== '{') {
        throw new Error(`Cannot load snapshot file. File "${filename} does not contain valid JSON or javascript`);
      }

      try {
        content = JSON.parse(fileContents);
      } catch(jsonEx) {
        throw new Error(`Cannot read snapshot "${filename}" as JSON: ${jsonEx}`);
      }
    }

    return content;
  }

  return {};
}

export function updateSnapshot(filename, snapshotTitle, subject, dataType = TYPE_JSON) {
  const store = readFile(filename);
  if (dataType === TYPE_JSON) {
    store[snapshotTitle] = JSON.parse(subject);
  } else {
    store[snapshotTitle] = subject;
  }


  // Reformat to `exports` format which is nicer for Git diffs
  const saveResult = Object.keys(store).reduce((result, key) => {
    let value = store[key];
    if (typeof value === 'string') {
      value = ` \`\n${value.trim().replace(/\\/g, '\\\\').replace(/`/g, '\\`')}\n\``;
    } else {
      value = `\n${formatJson(value)}`;
    }
    result += `exports[\`${key}\`] =${value}`;
    result += ";\n\n";

    return result;
  }, '');

  fs.writeFileSync(filename, `${saveResult.trim()}\n`);
}
