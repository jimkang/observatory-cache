/* global process */

var GitHubProjectsSource = require('github-projects-source');
var config = require('./config');
var leveldown = require('leveldown');
var request = require('request');

var projectsToCareAbout = undefined;
var deedCount = 0;

function streamFromProjectsSource() {
  var githubProjectsSource = GitHubProjectsSource({
    db: leveldown,
    request: request,
    userAgent: 'observatory-cache',
    githubToken: config.githubToken,
    username: 'jimkang',
    userEmail: 'jimkang@gmail.com',
    onNonFatalError: logError,
    onDeed: writeDeed,
    onProject: writeProject,
    filterProject: projectsToCareAbout ? weCareAboutThisProject : undefined,
    dbName: 'api-deed-stream',
    queryLogger: console.error
  });

  githubProjectsSource.startStream(
    {sources: ['local', 'API']},
    onStreamEnd
  );

  function writeDeed(deed) {
    deedCount += 1;
    process.stdout.write(JSON.stringify(deed) + '\n');
  }

  function writeProject(project) {
    process.stdout.write(JSON.stringify(project) + '\n');
  }

  function onStreamEnd(error) {
    console.error('deedCount', deedCount);
    if (error) {
      logError(error);
    }
  }
}

function logError(error) {
  console.error(error);
}

function weCareAboutThisProject(project) {
  return projectsToCareAbout.indexOf(project.name) !== -1;
}

streamFromProjectsSource();
