/* global process, Buffer */

var GitHubProjectsSource = require('github-projects-source');
var config = require('./config');
var leveldown = require('leveldown');
var request = require('request');
var GitHubFile = require('github-file');
var sb = require('standard-bail')();

function kickOff() {
  var githubFile = GitHubFile({
    branch: 'gh-pages',
    repo: 'observatory-meta',
    gitRepoOwner: 'jimkang',
    gitToken: config.githubToken,
    shouldSetUserAgent: true,
    encodeInBase64,
    decodeFromBase64,
    request
  });

  githubFile.get('ignore.json', sb(streamFromProjectsSource, logError));
}

function streamFromProjectsSource(projectsToIgnoreGitFile) {
  var projectsToIgnore = [];
  if (projectsToIgnoreGitFile && projectsToIgnoreGitFile.content) {
    projectsToIgnore = JSON.parse(projectsToIgnoreGitFile.content);
  }
  var emittedDeeds = {};
  var projects = {};

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
    onProject: storeProject,
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

  function storeProject(project) {
    projects[project.id] = project;
  }

  function onStreamEnd(error) {
    console.error('deedCount', Object.keys(emittedDeeds));
    if (error) {
      logError(error);
    }
    for (var projectId in projects) {
      writeProject(projects[projectId]);
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

function writeProject(project) {
  process.stdout.write(JSON.stringify(project) + '\n');
}

kickOff();

function encodeInBase64(s) {
  return Buffer.from(s, 'utf8').toString('base64');
}
function decodeFromBase64(s) {
  return Buffer.from(s, 'base64').toString('utf8');
}
