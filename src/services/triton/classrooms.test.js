import { postParticipationCode } from './classrooms';

// @todo: turn this into a generic "mock fetch repsonse"
jest.spyOn(window, 'fetch').mockImplementation(
  () =>
    new Promise((resolve, reject) =>
      resolve({
        ok: true,
        headers: {
          get: () => undefined,
        },
        json: () => new Promise((res, rej) => res()),
      }),
    ),
);

describe('classrooms api service', () => {
  it('sends classroom.program_label in the POST', async () => {
    const teamId = 'Team_foo';
    const survey = {
      uid: 'Survey_foo',
      team_id: teamId,
      metrics: [],
      open_responses: [],
    };
    const classroom = {
      uid: 'Classroom_foo',
      name: 'Classroom Foo',
      team_id: teamId,
      // Not normally part of the classroom, but sent by the
      // ClassroomDetailsForm.
      program_label: 'ep19',
    };

    await postParticipationCode(classroom, survey);

    expect(fetch.mock.calls.length).toBe(1);
    const [[, { body }]] = fetch.mock.calls;
    const postParams = JSON.parse(body);

    expect(postParams.program_label).toBe(classroom.program_label);
  });
});
