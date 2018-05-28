# @atomist/spring-automation

[![npm version](https://badge.fury.io/js/%40atomist%2Fspring-automation.svg)](https://badge.fury.io/js/%40atomist%2Fspring-automation)

This repository contains Atomist support functions and classes for Spring Boot and Maven:
generators, editors and reviewers. It is intended to be use as a
Node module in Atomist Software Delivery Machine implementations.

Supports both Java and Kotlin. Many types such as `JavaProjectStructure` work
for both languages.

## Node.js

You will need to have [Node.js][node] installed.  To verify that the
right versions are installed, please run:

```
$ node -v
v8.4.0
$ npm -v
5.4.1
```

The `node` version should be 8 or greater and the `npm` version should
be 5 or greater.

[node]: https://nodejs.org/ (Node.js)

## Cloning the repository and installing dependencies

To get started run the following commands:

```
$ git clone git@github.com:atomist/spring-automation.git
$ cd spring-automation
$ npm install
$ npm run build
```

## Release

Releases are managed by the [Atomist SDM][atomist-sdm].  Press the
"Release" button in the Atomist dashboard or Slack.

[atomist-sdm]: https://github.com/atomist/atomist-sdm (Atomist Software Delivery Machine)

---

Created by [Atomist][atomist].
Need Help?  [Join our Slack team][slack].

[atomist]: https://atomist.com/ (Atomist - How Teams Deliver Software)
[slack]: https://join.atomist.com (Atomist Community Slack)
