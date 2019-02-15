/* global process */

var GitHubProjectsSource = require('github-projects-source');
var config = require('./config');
var leveldown = require('leveldown');
var request = require('request');
var sb = require('standard-bail')();

function kickOff() {
  request(
    { url: 'https://jimkang.github.io/observatory-meta/ignore.json', json: true },
    sb(streamFromProjectsSource, logError)
  );
}

function streamFromProjectsSource(res, projectsToIgnore) {
  var emittedDeeds = {};

  console.error('projectsToIgnore', projectsToIgnore);

  var githubProjectsSource = GitHubProjectsSource({
    db: leveldown,
    request,
    userAgent: 'observatory-cache',
    githubToken: config.githubToken,
    username: 'jimkang',
    userEmail: 'jimkang@gmail.com',
    onNonFatalError: logError,
    onDeed: storeDeed,
    onProject: writeProject,
    filterProject: projectsToIgnore ? weCareAboutThisProject : undefined,
    dbName: 'api-deed-stream',
    branchMetadataIsOn: 'gh-pages'
    // queryLogger: console.error
  });

  githubProjectsSource.startStream({ sources: ['local', 'API'] }, onStreamEnd);

  // Right now, if multiple copies of the same deed are emitted, the last one
  // one is the one that'll end up written to stdout.
  function storeDeed(deed) {
    emittedDeeds[deed.id] = deed;
  }

  function writeProject(project) {
    process.stdout.write(JSON.stringify(project) + '\n');
  }

  function onStreamEnd(error) {
    console.error('deedCount', Object.keys(emittedDeeds));
    if (error) {
      logError(error);
    }
    for (var id in emittedDeeds) {
      writeDeed(emittedDeeds[id]);
    }
  }

  function weCareAboutThisProject(project) {
    return projectsToIgnore.indexOf(project.name) === -1;
  }
}

function logError(error) {
  console.error(error);
}

function writeDeed(deed) {
  process.stdout.write(JSON.stringify(deed) + '\n');
}

kickOff();
