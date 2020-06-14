// Looks at second object provided and filters down to the properties where the
// key of the property exists as a key in the first object. The actual value
// of the properties does not need to match.
//
// Example:
//  const classroomsById = {
//    Classroom_001: { name: 'English for Snakes' },
//    Classroom_002: { name: 'Python for Pythons' },
//    Classroom_003: { name: 'Calculus for Cobras' },
//  }
//  const participationByClassroomId = {
//    Classroom_002: { stats: ... },
//    Classroom_004: { stats: ... },
//  }
//  pickFirstWhereInSecondByKeys(classroomsById, participationByClassroomId)
//
//  Would return:
//  {
//    Classroom_002: { stats: ... },
//  }

import keys from 'lodash/keys';
import pickBy from 'lodash/pickBy';

const pickSecondWhereInFirstByKeys = (first = {}, second = {}) =>
  pickBy(second, (v, k) => keys(first).includes(k));

export default pickSecondWhereInFirstByKeys;
