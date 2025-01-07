export function formatJson(subject) {
  return JSON.stringify(subject, undefined, 2);
}

export function formatNormalizedJson(subject) {
  return formatJson(normalizeObject(subject));
}

export function normalizeObject(subject) {
  if (Array.isArray(subject)) {
    return subject.map(normalizeObject);
  }

  if (typeof subject === 'object' && subject !== null) {
    const keys = Object.keys(subject);
    keys.sort();

    return keys.reduce((result, key) => {
      result[key] = normalizeObject(subject[key]);
      return result;
    }, {});
  }

  return subject;
}

