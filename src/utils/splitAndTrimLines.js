// Given an inputString, splitAndTrimLines will return an array consisting of
// each line with front/end whitespace trimmmed and all empty lines filtered
// out.
//
// Example:
//
//   const inputString = `
//      00001
//      00002
//
//      00003
//   `;
//   const ids = splitAndTrimLines(inputString);
//
//   id will contain ['00001', '00002', '00003']

const splitAndTrimLines = inputString => {
  if (
    inputString === null ||
    inputString === undefined ||
    inputString.length === 0
  ) {
    return [];
  }

  // https://stackoverflow.com/questions/5034781/js-regex-to-split-by-line#comment5633979_5035005
  // http://www.unicode.org/reports/tr18/#Line_Boundaries
  const newLineRegex = /\r\n|[\n\v\f\r\x85\u2028\u2029]/;

  return (
    inputString
      .split(newLineRegex)
      // Trim whitespace from front/end of student_id. Allowing for whitespace
      // in the middle in case student_id consists of names (eg "Cree Summer").
      .map(id => id.trim())
      // Filter out any empty lines.
      .filter(id => id.length > 0)
  );
};

export default splitAndTrimLines;
