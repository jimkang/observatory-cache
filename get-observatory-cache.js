/* global process */

var GitHubProjectsSource = require('github-projects-source');
var config = require('./config');
var leveldown = require('leveldown');
var request = require('request');
var sb = require('standard-bail')();
var bodyMover = require('request-body-mover');
var CollectInChannel = require('collect-in-channel');
var waterfall = require('async-waterfall');
var curry = require('lodash.curry');

function kickOff() {
  var channel = {};
  var Collect = CollectInChannel({ channel });
  waterfall(
    [
      curry(getJSONAsProp)(
        {
          url: 'https://jimkang.com/observatory-meta/ignore.json',
          propToPassResultIn: 'projectsToIgnore'
        },
        {}
      ),
      Collect({ props: ['projectsToIgnore'] }),
      curry(getJSONAsProp)(
        {
          url: 'https://jimkang.com/observatory-meta/projects.json',
          propToPassResultIn: 'metadataForProjects'
        }
      ),
      Collect({ props: ['metadataForProjects'] }),
      streamFromProjectsSource
    ],
    logError
  );
}

function getJSONAsProp({ url, propToPassResultIn }, channel, done) {
  var reqOpts = {
    url,
    json: true
  };
  request(reqOpts, bodyMover(sb(wrapResult)));

  function wrapResult(result) {
    // [This notation for keys is infuriating].
    done(null, { [propToPassResultIn]: result });
  }
}

function streamFromProjectsSource({ projectsToIgnore, metadataForProjects }) {
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
    dbName: 'api-deed-stream'
    // queryLogger: console.error
  });

  githubProjectsSource.startStream({ sources: ['local', 'API'] }, onStreamEnd);

  // Right now, if multiple copies of the same deed are emitted, the last one
  // one is the one that'll end up written to stdout.
  function storeDeed(deed) {
    emittedDeeds[deed.id] = deed;
  }

  function writeProject(project) {
    var metadata = metadataForProjects[project.name];
    if (metadata) {
      debugger;
      Object.assign(project, metadata);
    }
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
