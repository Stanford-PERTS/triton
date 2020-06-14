import mocks from './';

export default function createProgram(options) {
  const uid = mocks.createUid('Program');
  const short_uid = mocks.shortUid(uid);
  const name = 'Demo Program';
  const label = 'demo';
  const metrics = JSON.stringify([
    { uid: 'Metric_classroom-belonging', default_active: true },
    { uid: 'Metric_cultural-competence', default_active: true },
    { uid: 'Metric_feedback-for-growth', default_active: true },
    { uid: 'Metric_identity-threat', default_active: true },
    { uid: 'Metric_institutional-gms', default_active: true },
    { uid: 'Metric_meaningful-work', default_active: true },
    { uid: 'Metric_social-belonging', default_active: true },
    { uid: 'Metric_stem-efficacy', default_active: true },
    { uid: 'Metric_student-voice', default_active: true },
    { uid: 'Metric_teacher-caring', default_active: true },
    { uid: 'Metric_trust-fairness', default_active: true },
  ]);
  const survey_config_enabled = true;
  const target_group_enabled = true;
  const use_cycles = true;
  const use_classrooms = true;
  const min_cycles = 1;
  const max_cycles = -1;
  const min_cycle_weekdays = 5;
  const send_cycle_email = true;
  const max_team_members = -1;
  const team_term = 'Team';
  const classroom_term = 'Classroom';
  const captain_term = 'Captain';
  const contact_term = 'Main Contact';
  const member_term = 'Teacher';
  const preview_url = `https://saturn.perts.net/surveys/${label}`;
  const active = true;

  const program = {
    uid,
    short_uid,
    name,
    label,
    metrics,
    survey_config_enabled,
    target_group_enabled,
    use_cycles,
    use_classrooms,
    max_cycles,
    min_cycles,
    min_cycle_weekdays,
    send_cycle_email,
    max_team_members,
    team_term,
    classroom_term,
    captain_term,
    contact_term,
    member_term,
    preview_url,
    active,
    ...options,
  };

  return program;
}
