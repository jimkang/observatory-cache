/* global process */

var GitHubProjectsSource = require('github-projects-source');
var config = require('./config');
var leveldown = require('leveldown');
var request = require('request');

var projectsToIgnore = [
  'github-file-test',
  'asi-http-request',
  'objectiveflickr',
  'facebook-ios-sdk',
  'ShakeKit',
  'sublime-user-package',
  'KIF',
  'oauthconsumer',
  'javascript-karplus-strong',
  'srv-request',
  'word2vec',
  'nearest-neighbor-test-data',
  'annoy',
  'protobuf',
  'openelections-sources-ma',
  'node-github',
  'node-ci',
  'forever-monitor',
  'jimp',
  'node-braque',
  'timezones.json',
  'restify-cors-middleware',
  'prezto',
  'paella',
  'jamchops',
  'level-browserify',
  'node-webkit-screenshot'
];
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
    filterProject: projectsToIgnore ? weCareAboutThisProject : undefined,
    dbName: 'api-deed-stream',
    // queryLogger: console.error
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
  return projectsToIgnore.indexOf(project.name) === -1;
}

streamFromProjectsSource();
