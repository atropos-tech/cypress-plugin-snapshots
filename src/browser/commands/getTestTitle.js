function getTestTitle(test) {
  return (test.parent && test.parent.title ? `${getTestTitle(test.parent)} > ` : '') + test.title;
}

export default getTestTitle;
