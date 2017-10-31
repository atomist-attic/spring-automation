# @atomist/initializr-atomist

[![Build Status](https://travis-ci.org/atomist/initializr-atomist.svg?branch=master)](https://travis-ci.org/atomist/initializr-atomist)

This repository contains the Atomist backend for Spring Initializr.

## Prerequisites

### Access to Atomist testing environment

To get access to this preview, please reach out to members of Atomist
in the `#support` channel of [atomist-community Slack team][slack].

You'll receive an invitation to a Slack team and GitHub organization
that can be used to explore this new approach to writing and running
automations.

### Node.js

You will need to have [Node.js][node] installed.  To verify that the
right versions are installed, please run:

```
$ node -v
v8.4.0
$ npm -v
5.4.1
```

[node]: https://nodejs.org/ (Node.js)

### Cloning the repository and installing dependencies

To get started run the following commands:

```
$ git clone git@github.com:atomist/automation-client-samples-ts.git
$ cd automation-client-samples-ts
$ npm install
```

### Configuring your environment

For the client to connect and authenticate to the Atomist API, a
GitHub personal access token is required. Additionally the API
is only allowing members of a GitHub team called `atomist-automation`
to successfully authenticate and register a new client.

Please create a team in your GitHub organization with the name
`atomist-automation` and add the user you want to use to the team. 

After that you can create a personal access token with `read:org` 
scope at https://github.com/settings/tokens. 

Once you obtained the token, make it available to the client by
exporting it into an environment variable:

```
$ export GITHUB_TOKEN=<your token goes here>
```

Alternatively you can also place the token in `src/atomist.config.ts`.

## Starting up the automation-client

To start the client, run the following command:

```
$ npm run start
```

## Support

General support questions should be discussed in the `#support`
channel in our community Slack team
at [atomist-community.slack.com][slack].

If you find a problem, please create an [issue][].

[issue]: https://github.com/atomist/automation-client-samples-ts/issues

## Development

You will need to install [node][] to build and test this project.

### Build and Test

Command | Reason
------- | ------
`npm install` | to install all the required packages
`npm run start` | to start the Atomist automation client
`npm run lint` | to run tslint against the TypeScript
`npm run compile` | to compile all TypeScript into JavaScript
`npm test` | to run tests and ensure everything is working
`npm run autotest` | run tests continuously (you may also need to run `tsc -w`)
`npm run clean` | remove stray compiled JavaScript files and build directory

### Release

To create a new release of the project, simply push a tag of the form
`M.N.P` where `M`, `N`, and `P` are integers that form the next
appropriate [semantic version][semver] for release.  The version in
the package.json is replaced by the build and is totally ignored!  For
example:

[semver]: http://semver.org

```
$ git tag -a 1.2.3
$ git push --tags
```

The Travis CI build (see badge at the top of this page) will publish
the NPM module and automatically create a GitHub release using the tag
name for the release and the comment provided on the annotated tag as
the contents of the release notes.

---

Created by [Atomist][atomist].
Need Help?  [Join our Slack team][slack].

[atomist]: https://www.atomist.com/
[slack]: https://join.atomist.com
