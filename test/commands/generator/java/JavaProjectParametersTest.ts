/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import "mocha";
import * as assert from "power-assert";

import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import { cleanTravisBuildFiles } from "../../../../src/commands/generator/java/JavaProjectParameters";

describe("JavaProjectParameters", () => {

    describe("cleanTravisBuildFiles", () => {

        const fullTravisYaml = `dist: trusty
sudo: false
language: java
jdk:
  - openjdk8
addons:
  apt:
    packages:
      - libxml2-utils
branches:
  except:
    - "/\\\\+travis\\\\d+$/"
env:
  global:
    - secure: MJPd78371wjFdSG9J5RVx9IEERkEmQ98lgERO4ka30B8xPgPHGcuA6XSk
install: true
script: bash .travis/travis-build.bash
notifications:
  email: false
  webhooks:
    on_success: always
    on_failure: always
    on_start: always
    on_error: always
    on_cancel: always
    urls:
      - https://webhook.atomist.com/atomist/travis/teams/TK421WAYA
cache:
  directories:
    - "$HOME/.m2"
`;

        const teamId = "TH30F0RC3";
        const webhookUrl = `https://webhook.atomist.com/atomist/travis/teams/${teamId}`;
        const cleanTravisYaml = `dist: trusty
sudo: false
language: java
jdk:
  - openjdk8
notifications:
  email: false
  webhooks:
    on_success: always
    on_failure: always
    on_start: always
    on_error: always
    on_cancel: always
    urls:
      - '${webhookUrl}'
cache:
  directories:
    - "$HOME/.m2"
`;

        it("should clean Travis files", done => {
            const testFiles = [
                { path: "README.md", content: "# This project\n" },
                { path: "LICENSE", content: "The license.\n" },
                { path: "CODE_OF_CONDUCT.md", content: "The code.\n" },
                { path: "CONTRIBUTING.md", content: "Contribute.\n" },
                { path: "src/main/java/Command.java", content: "package main" },
                { path: ".travis/travis-build.bash", content: "#!/bin/bash\n" },
                { path: ".travis/some.patch", content: "--- a/c.d\n+++ b/c.d\n" },
                { path: ".travis.yml", content: fullTravisYaml },
                { path: "src/test/scala/CommandTest.scala", content: "package main" },
                { path: ".travis-save/travis-build.bash", content: "#!/bin/bash\necho save me\n" },
            ];

            const project = InMemoryProject.of(...testFiles);
            cleanTravisBuildFiles(webhookUrl, project).then(p => {
                const remain = [
                    "README.md",
                    "LICENSE",
                    "CODE_OF_CONDUCT.md",
                    "CONTRIBUTING.md",
                    "src/main/java/Command.java",
                    "src/test/scala/CommandTest.scala",
                    ".travis-save/travis-build.bash",
                ];
                remain.forEach(f => assert(p.fileExistsSync(f)));
                const gone = [".travis/travis-build.bash", ".travis/some.patch"];
                gone.forEach(f => assert(!p.fileExistsSync(f)));
                assert(!p.directoryExistsSync(".travis"));
                const travisFile = p.findFileSync(".travis.yml");
                assert(travisFile, ".travis.yml not found");
                const travisYaml = travisFile.getContentSync();
                assert(travisYaml === cleanTravisYaml);
            }).then(done, done);
        });

        it("should successfully do nothing", done => {
            const testFiles = [
                { path: "README.md", content: "# This project\n" },
                { path: "LICENSE", content: "The license.\n" },
                { path: "CODE_OF_CONDUCT.md", content: "The code.\n" },
                { path: "CONTRIBUTING.md", content: "Contribute.\n" },
                { path: "src/main/java/Command.java", content: "package main" },
                { path: "src/test/scala/CommandTest.scala", content: "package main" },
                { path: ".travis-save/travis-build.bash", content: "#!/bin/bash\necho save me\n" },
            ];
            const project = InMemoryProject.of(...testFiles);
            cleanTravisBuildFiles(webhookUrl, project).then(p => {
                testFiles.map(f => f.path).forEach(f => assert(p.fileExistsSync(f)));
            }).then(done, done);
        });

    });

});
