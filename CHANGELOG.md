# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased][]

[Unreleased]: https://github.com/atomist/spring-automation/compare/0.6.0...HEAD

## [0.6.0][]

[0.6.0]: https://github.com/atomist/spring-automation/compare/0.5.0...0.6.0

Seed release

### Changed

-   Update to @atomist/automation-client@0.6.5 to allow users to
    provide generator seed parameters
-   Various improvements to Travis build

## [0.5.0][]

[0.5.0]: https://github.com/atomist/spring-automation/compare/0.4.0...0.5.0

Kubernetes release

### Changed

-   Migrated automated deployment from Cloud Foundry to k8

### Fixed

-   Support for GHE

## [0.4.0][]

[0.4.0]: https://github.com/atomist/spring-automation/compare/0.3.0...0.4.0

Freedom release

### Changed

-   Update @atomist/automation-client
-   Find POM files everywhere, not just at top-level of project
-   General improvements making less Spring and GitHub specific

### Added

-   Add tags in generator

### Fixed

-   Fixed bug where version upgrades didn't work across all repos in
    org

## [0.3.0][]

[0.3.0]: https://github.com/atomist/spring-automation/compare/0.2.0...0.3.0

Staging release

### Added

-   reviewerToCommand
-   @RequestMapping search
-   Environment-specific configuration

### Changed

-   Aligned with ReviewComment
-   Updated client to latest build
-   Leave a proper .travis.yml in generated project

### Fixed

-   Properly replace name and description in POM

## [0.2.0][] - 2017-11-28

[0.2.0]: https://github.com/atomist/spring-automation/tree/0.2.0

Initial-ish Release

### Added

-   Everything
