/* eslint no-console: "off" */

import chalk from 'chalk';
import fs from 'fs';
import http from 'http';
import keyBy from 'lodash/keyBy';
import moment from 'moment/moment';
import mysql from 'mysql';
import path from 'path';
import yaml from 'js-yaml';

import {
  arrayToString,
  generateUsers,
  generateTeams,
  associateUsersWithTeams,
  generateAdminUser,
  generateClassrooms,
  generateMetrics,
  generateOrganizations,
  generatePrograms,
  associateTeamsWithOrganizations,
  associateUsersWithOrganizations,
  generateParticipants,
  generateSurveys,
  generateReports,
  generateCyclesForTeam,
  generateResponsesForTeam,
} from 'utils/fakerUtils';

// Javascript objects with missing properties or those explicitly set to
// null should get the value NULL in an INSERT query.
const defaultNull = v => (v === undefined || v === null ? `NULL` : `'${v}'`);

const optionalFieldName = (name, value) =>
  value === undefined ? '' : `, \`${name}\``;

const optional = v => {
  if (v === undefined) {
    return '';
  }
  if (v === null) {
    return ', NULL';
  }
  if (typeof v === 'number') {
    return `, ${v}`;
  }
  if (typeof v === 'boolean') {
    return v ? ', TRUE' : ', FALSE';
  }
  return `, '${v}'`;
};

const saveToDatabase = (db, json) => {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'triton',
    password: 'triton',
    database: db,
  });

  connection.connect();

  // first, drop the database
  connection.query(`drop database if exists \`${db}\``, (err, resp) => {
    if (err) {
      console.log(chalk.blue(`...There was no existing ${db} database.`));
    }
    if (resp) {
      console.log(chalk.blue('...Deleted existing database.'));
    }

    // then trigger an http call so that gae initializes the database
    const httpOptions = {
      host: 'localhost',
      port: 10080,
      path: '/',
      method: 'GET',
    };

    let onlyOnce = false;

    const httpReq = http.request(httpOptions, optionsResponse => {
      optionsResponse.on('data', () => {
        if (onlyOnce) {
          return;
        }
        onlyOnce = true;
        console.log(chalk.blue('...Initialized database.'));

        connection.query(`use \`${db}\``);

        // once we get a response, now we can add our fake data
        // ...users
        json.users.forEach(user => {
          const sql = `
          insert into user
          (
            uid,
            short_uid,
            name,
            email,
            user_type,
            owned_teams,
            owned_organizations
          )
          values
          (
            '${user.uid}',
            '${user.short_uid}',
            ${connection.escape(user.name)},
            ${connection.escape(user.email)},
            '${user.user_type}',
            '${arrayToString(user.owned_teams)}',
            '${arrayToString(user.owned_organizations)}'
          )
          `;
          connection.query(sql);
        });

        // ...teams
        json.teams.forEach(team => {
          const sql = `
          insert into team
          (
            uid,
            short_uid,
            name,
            survey_reminders,
            report_reminders,
            captain_id,
            organization_ids,
            program_id,
            task_data
          )
          values
          (
            '${team.uid}',
            '${team.short_uid}',
            ${connection.escape(team.name)},
            '${team.survey_reminders}',
            '${team.report_reminders}',
            '${team.captain_id}',
            '${JSON.stringify(team.organization_ids)}',
            ${defaultNull(team.program_id)},
            '${JSON.stringify(team.task_data)}'
          )
          `;
          connection.query(sql);
        });

        // ...classrooms
        json.classrooms.forEach(classroom => {
          const sql = `
          insert into classroom
          (
            uid,
            short_uid,
            name,
            code,
            team_id,
            contact_id,
            num_students,
            grade_level
          )
          values
          (
            '${classroom.uid}',
            '${classroom.short_uid}',
            ${connection.escape(classroom.name)},
            ${connection.escape(classroom.code)},
            '${classroom.team_id}',
            '${classroom.contact_id}',
            '${classroom.num_students}',
            '${classroom.grade_level}'
          )
          `;
          connection.query(sql);
        });

        // ...participants
        json.participants.forEach(participant => {
          const sql = `
          insert into participant
          (
            uid,
            short_uid,
            student_id,
            stripped_student_id,
            team_id,
            classroom_ids
          )
          values
          (
            '${participant.uid}',
            '${participant.short_uid}',
            '${participant.student_id}',
            '${participant.stripped_student_id}',
            '${participant.team_id}',
            '${JSON.stringify(participant.classroom_ids)}'
          )
          `;
          connection.query(sql);
        });

        // ...metrics
        json.metrics.forEach(metric => {
          const sql = `
          insert into metric
          (
            uid,
            short_uid,
            name,
            label,
            description,
            links
          )
          values
          (
            '${metric.uid}',
            '${metric.short_uid}',
            ${connection.escape(metric.name)},
            ${connection.escape(metric.label)},
            ${connection.escape(metric.description)},
            ${connection.escape(JSON.stringify(metric.links))}
          )
          `;
          connection.query(sql);
        });

        // ...organizations
        json.organizations.forEach(organization => {
          const sql = `
          insert into organization
          (
            uid,
            short_uid,
            code,
            name,
            phone_number,
            mailing_address,
            program_id
          )
          values
          (
            '${organization.uid}',
            '${organization.short_uid}',
            '${organization.code}',
            '${organization.name}',
            '${organization.phone_number}',
            '${organization.mailing_address}',
            ${defaultNull(organization.program_id)}
          )
          `;
          connection.query(sql);
        });

        // ...programs
        json.programs.forEach(program => {
          const sql = `
          insert into program
          ( uid
          , short_uid
          , name
          , label
          , metrics
          ${optionalFieldName(
            'survey_config_enabled',
            program.survey_config_enabled,
          )}
          ${optionalFieldName(
            'target_group_enabled',
            program.target_group_enabled,
          )}
          ${optionalFieldName('use_cycles', program.use_cycles)}
          ${optionalFieldName('use_classrooms', program.use_classrooms)}
          ${optionalFieldName('max_cycles', program.max_cycles)}
          ${optionalFieldName('min_cycles', program.min_cycles)}
          ${optionalFieldName('send_cycle_email', program.send_cycle_email)}
          ${optionalFieldName('max_team_members', program.max_team_members)}
          ${optionalFieldName('team_term', program.team_term)}
          ${optionalFieldName('classroom_term', program.classroom_term)}
          ${optionalFieldName('captain_term', program.captain_term)}
          ${optionalFieldName('contact_term', program.contact_term)}
          ${optionalFieldName('member_term', program.member_term)}
          ${optionalFieldName('organization_term', program.organization_term)}
          , preview_url
          ${optionalFieldName('active', program.active)}
          )
          values
          ( '${program.uid}'
          , '${program.short_uid}'
          , '${program.name}'
          , '${program.label}'
          , '${program.metrics}'
          ${optional(program.survey_config_enabled)}
          ${optional(program.target_group_enabled)}
          ${optional(program.use_cycles)}
          ${optional(program.use_classrooms)}
          ${optional(program.max_cycles)}
          ${optional(program.min_cycles)}
          ${optional(program.send_cycle_email)}
          ${optional(program.max_team_members)}
          ${optional(program.team_term)}
          ${optional(program.classroom_term)}
          ${optional(program.captain_term)}
          ${optional(program.contact_term)}
          ${optional(program.member_term)}
          ${optional(program.organization_term)}
          , '${program.preview_url}'
          ${optional(program.active)}
          )
          `;
          connection.query(sql);
        });

        // ...surveys
        json.surveys.forEach(survey => {
          const sql = `
          insert into survey
          (
            uid,
            short_uid,
            team_id,
            metrics,
            meta
          )
          values
          (
            '${survey.uid}',
            '${survey.short_uid}',
            '${survey.team_id}',
            '${survey.metrics}',
            '${JSON.stringify(survey.meta)}'
          )
          `;
          connection.query(sql);
        });

        // ...reports
        json.reports.forEach(report => {
          const sql = `
          insert into report
          (
            uid,
            short_uid,
            parent_id,
            organization_id,
            team_id,
            classroom_id,
            filename,
            issue_date,
            template,
            dataset_id,
            content_type
          )
          values
          (
            '${report.uid}',
            '${report.short_uid}',
            '${report.parent_id}',
            ${report.organization_id ? `'${report.organization_id}'` : `NULL`},
            ${report.team_id ? `'${report.team_id}'` : `NULL`},
            ${report.classroom_id ? `'${report.classroom_id}'` : `NULL`},
            '${report.filename}',
            '${report.issue_date}',
            '${report.template}',
            '${report.dataset_id}',
            '${report.content_type}'
          )
          `;
          connection.query(sql);
        });

        // ...cycles
        json.cycles.forEach(cycle => {
          const startDate = cycle.start_date
            ? `'${moment(cycle.start_date).format('YYYY-MM-DD')}'`
            : 'NULL';
          const endDate = cycle.end_date
            ? `'${moment(cycle.end_date).format('YYYY-MM-DD')}'`
            : 'NULL';
          const sql = `
          insert into cycle
          (
            uid,
            short_uid,
            team_id,
            ordinal,
            start_date,
            end_date,
            meeting_datetime,
            meeting_location
          )
          values
          (
            '${cycle.uid}',
            '${cycle.short_uid}',
            '${cycle.team_id}',
            '${cycle.ordinal}',
            ${startDate},
            ${endDate},
            '${moment(cycle.meeting_datetime)
              .utc()
              .format()}',
            ${connection.escape(cycle.meeting_location)}
          )
          `;
          connection.query(sql);
        });

        // ...responses
        json.responses.forEach(response => {
          const sql = `
          insert into response
          (
            uid,
            short_uid,
            user_id,
            team_id,
            parent_id,
            module_label,
            progress,
            body
          )
          values
          (
            '${response.uid}',
            '${response.short_uid}',
            '${response.user_id}',
            '${response.team_id}',
            '${response.parent_id}',
            '${response.module_label}',
            '${response.progress}',
            '${response.body}'
          )
          `;
          connection.query(sql);
        });

        connection.end();
        console.log(chalk.green(`SUCCESS. Data saved to mysql (${db}).`));
      });
    });

    httpReq.end();
  });

  // Attempt to register these users with Neptune.
  json.users.forEach(user => {
    const body = JSON.stringify({
      email: user.email,
      platform: 'triton',
      domain: 'http://localhost:3000',
    });
    const httpOptions = {
      host: 'localhost',
      port: 8080,
      path: '/api/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Required or it will drop the request body (assumes 0 length).
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const httpReq = http.request(httpOptions);

    httpReq.write(body);

    httpReq.end();
  });
};

const generateDb = db => {
  const metrics = generateMetrics(6);
  const programs = generatePrograms(metrics);
  const programIndex = keyBy(programs, 'uid');
  const users = generateUsers(20);
  const teams = generateTeams(programs, 10);
  associateUsersWithTeams(users, teams);
  generateAdminUser(users);
  const classrooms = generateClassrooms(users, teams);
  const participants = generateParticipants(teams, classrooms);
  const organizations = generateOrganizations(programs, 3);
  associateTeamsWithOrganizations(teams, organizations);
  associateUsersWithOrganizations(users, organizations);
  const surveys = generateSurveys(teams, programs, metrics);
  const reports = generateReports(organizations, classrooms);

  let cycles = [];
  let responses = [];
  teams.forEach(t => {
    const teamCycles = generateCyclesForTeam(t, programIndex[t.program_id]);
    const teamUsers = users.filter(u => u.owned_teams.includes(t.uid));
    const teamResponses = generateResponsesForTeam(teamCycles, teamUsers);
    cycles = cycles.concat(teamCycles);
    responses = responses.concat(teamResponses);
  });

  const json = {
    users,
    teams,
    classrooms,
    metrics,
    organizations,
    programs,
    participants,
    surveys,
    reports,
    cycles,
    responses,
  };

  saveToDatabase(db, json);
};

console.log(chalk.blue('Generating Triton Dev Data...'));
try {
  const appYaml = yaml.safeLoad(
    fs.readFileSync(path.join(process.cwd(), 'app.yaml')),
  );
  const database = appYaml.env_variables.LOCAL_SQL_DB_NAME;
  console.log(chalk.blue(`...MySQL Database: ${database}`));
  generateDb(database);
} catch (e) {
  console.log(chalk.red('Error', e));
}
