import fs from 'fs';
import path from 'path';
import has from 'lodash/has';

const PATH_APP_TEMPLATE = path.join(process.env.PWD, 'app.template.yaml');
const PATH_BROWSER_ENV = path.join(process.env.PWD, 'branch_environment.json');

const environments = ['master', 'acceptance', 'dev', 'dev-*'];

describe('app.template.yaml file', () => {
  it('should exist', () => {
    expect(fs.existsSync(PATH_APP_TEMPLATE)).toEqual(true);
  });

  it('should have a accompanying branch_environment.json file', () => {
    expect(fs.existsSync(PATH_BROWSER_ENV)).toEqual(true);
  });

  it('should have all used variables defined by branch_environment', () => {
    const atFile = fs.readFileSync(PATH_APP_TEMPLATE, 'utf8');
    const beFile = fs.readFileSync(PATH_BROWSER_ENV, 'utf8');

    // retrieve all occurring variables from app.template.yaml
    const regex = /(?:\$\{)([A-Z_]*)(?:\})/g;
    const envVariables = [];
    let match;

    match = regex.exec(atFile);
    while (match != null) {
      envVariables.push(match[1]);
      match = regex.exec(atFile);
    }

    // parse json in browser_environment.json
    const beJson = JSON.parse(beFile);

    // verify that every variable used in app.template.yaml is defined in all
    // environments in branch_environment.json
    envVariables.forEach(v => {
      environments.forEach(e => {
        const pathToVariable = `["${e}"]["app.yaml"]["${v}"]`;
        expect(has(beJson, pathToVariable)).toBeTruthy();
      });
    });
  });
});
