/* eslint-disable */

/**
 * This script resets a team's data. Participants and participant data are
 * diassociated (they are not removed from the neptune tables to preserve
 * historical data and because it's not necessary). New classrooms similar to
 * the old ones are created (but with different participation codes), while the
 * old classrooms are deleted. Reports are re-associated to the new classrooms.
 * Neptune data related to the participation code are deleted.
 * 
 * To run this reset script:
 *
 * 1. Log in to copilot as a super admin.
 * 2. Find the right team. Make sure it's the right one. Paste the team id in
 *    as the value of `teamId`.
 * 3. Use the network panel to get a valid authorization header value, and
 *    paste it in as the value of `superAuthHeader`.
 * 4. Clear the network panel to make it easy to see what this script does.
 * 5. Paste all of this code into the console and press enter.
 * 6. Create a global variable with an empty array:
 *
 *    var oldClassrooms = [];
 *
 * 7. Run phase one, which creates new classrooms and moves reports. Use the
 *    correct team id here. Important: if you want to run phase one and two
 *    back-to-back, be sure to properly chain then with .then() methods.
 *
 *    phaseOne(teamId).then(cls => oldClassrooms = cls);
 *
 * 8. Observe the network panel, and check your datasources to confirm the
 *    correct changes have occurred, but don't refresh your page because you'll
 *    lose reference to the old classrooms.
 *
 * 9. When ready, run phase two.
 *
 *    phaseTwo(oldClassrooms);
 *
 * 10. Observe, check, etc.
 * 11. Optionally complete queries directly in the triton and neptune databases
 *     to further clean up neptune participants and participant data.
 */

var superAuthHeader = 'Bearer ...';
var teamId = 'Team_???';

var TRITON_DOMAIN = 'http://localhost:10080';
var NEPTUNE_DOMAIN = 'http://localhost:8080';

var metricsStr = (survey, prop) =>
  JSON.stringify(survey[prop].map(id => survey.metric_labels[id]));

var getSurveyParams = survey => ({
  learning_conditions: metricsStr(survey, 'metrics'),
  open_response_lcs: survey.open_responses
    ? metricsStr(survey, 'open_responses')
    : '[]',
});

var jsonResponse = response =>
  response.ok ? response.json() : Promise.reject(response);

var jsonFetch = (method, url, body) =>
  fetch(
      url,
      {
        method,
        headers: {
          'Authorization': superAuthHeader,
          'Content-Type': method === 'GET' ? undefined : 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      },
    )
    .then(response => {
      if (response.status !== 204) {
        return jsonResponse(response);
      }
    });

/**
 * Create new classrooms like the old, and re-associate reports.
 * @param  {string} teamId
 * @return {Array} of existing classrooms (to be deleted)
 */
function phaseOne(teamId) {
  const surveyUrl = `${TRITON_DOMAIN}/api/teams/${teamId}/survey`;
  const surveyGet = jsonFetch('GET', surveyUrl);

  const classroomUrl = `${TRITON_DOMAIN}/api/teams/${teamId}/classrooms`;
  const classroomGet = jsonFetch('GET', classroomUrl);

  const reportUrl = `${TRITON_DOMAIN}/api/teams/${teamId}/reports`;
  const reportGet = jsonFetch('GET', reportUrl);

  let oldClassrooms;

  return Promise.all([surveyGet, classroomGet, reportGet])
    .then(([survey, classrooms, reports]) => {
      oldClassrooms = classrooms;
      return createNewClassrooms(survey, classrooms)
        .then(newByOldId => updateReports(reports, newByOldId))
        .then(() => oldClassrooms);
    });
}

function createNewClassrooms(survey, oldClassrooms) {
  console.log("createNewClassrooms", survey, oldClassrooms);
  return Promise.all(oldClassrooms.map(c => {
      const newCode = {
        organization_id: c.team_id,
        program_label: 'triton',
        survey_params: getSurveyParams(survey),
      }
      return jsonFetch('POST', `${NEPTUNE_DOMAIN}/api/codes`, newCode)
        .then(codeResponse => {
          const url = `${TRITON_DOMAIN}/api/classrooms`;
          const newClassroom = {
            name: c.name,
            team_id: c.team_id,
            contact_id: c.contact_id,
            num_students: c.num_students,
            grade_level: c.grade_level,
            code: codeResponse.code,
          };
          return jsonFetch('POST', url, newClassroom);
        });
    }))
    .then(classroomData => {
      console.log("new classrooms complete", classroomData);
      newByOldId = {};
      for (let x = 0; x < oldClassrooms.length; x += 1) {
        newByOldId[oldClassrooms[x].uid] = classroomData[x];
      }
      console.log("created newByOldId:", newByOldId);
      return newByOldId;
    });
}

function updateReports(reports, newByOldId) {
  console.log("updateReports", reports, newByOldId);
  return Promise.all(reports.map(r => {
    // team reports don't have a classroom id, but classroom reports need
    // the mapped classroom id.
    const newClassId = r.classroom_id ? newByOldId[r.classroom_id].uid : null;
    const newReport = {
      ...r,
      classroom_id: newClassId,
      type: newClassId || 'Team',
    };
    return jsonFetch('PUT', `${TRITON_DOMAIN}/api/reports/${r.uid}`, newReport);
  }));
}

/**
 * Delete old classrooms and their codes on neptune.
 * @param  {Array} oldClassrooms
 * @return {undefined}
 */
function phaseTwo(oldClassrooms) {
  oldClassrooms.forEach(c => {
    getParticipants(c)
      .then(deleteParticipants)
      .then(() => deleteClassroom(c))
      .then(deleteAuth => deleteCode(c, deleteAuth));
  });
}

function getParticipants(classroom) {
  const url = `${TRITON_DOMAIN}/api/classrooms/${classroom.uid}/participants`;
  return jsonFetch('GET', url);
}

function deleteParticipants(participants) {
  return Promise.all(participants.map(p =>
    jsonFetch('DELETE', `${TRITON_DOMAIN}/api/participants/${p.uid}`)
  ));
}

function deleteClassroom(classroom) {
  return fetch(
      `${TRITON_DOMAIN}/api/classrooms/${classroom.uid}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': superAuthHeader,
        },
      },
    )
    .then(response => {
      if (!response.ok) {
        return Promise.reject(response);
      }
      return response.headers.get('authorization');
    })
}

function deleteCode(classroom, deleteAuth) {
  const url = `${NEPTUNE_DOMAIN}/api/codes/${classroom.code.replace(/ /g, '-')}`;
  return fetch(
      url,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': deleteAuth,
        },
      },
    )
    .then(response => { if (!response.ok) {return Promise.reject(response)} });
}
