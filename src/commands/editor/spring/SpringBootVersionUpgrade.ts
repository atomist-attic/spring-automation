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

import { HandleCommand } from "@atomist/automation-client";
import { allReposInTeam } from "@atomist/automation-client/operations/common/allReposInTeamRepoFinder";
import { gitHubRepoLoader } from "@atomist/automation-client/operations/common/gitHubRepoLoader";
import { RepoFinder } from "@atomist/automation-client/operations/common/repoFinder";
import { RepoLoader } from "@atomist/automation-client/operations/common/repoLoader";
import { EditMode, PullRequest } from "@atomist/automation-client/operations/edit/editModes";
import { editorHandler } from "@atomist/automation-client/operations/edit/editorToCommand";
import { DefaultDirectoryManager } from "@atomist/automation-client/project/git/GitCommandGitProject";
import { setSpringBootVersionEditor } from "./setSpringBootVersionEditor";
import { UnleashPhilParameters } from "./unleashPhil";

/**
 * Upgrade the version of Spring Boot projects to a desired version
 */
export function springBootVersionUpgrade(repoFinder: RepoFinder = allReposInTeam(),
                                         repoLoader: (p: UnleashPhilParameters) => RepoLoader =
                                             p => gitHubRepoLoader(p.targets.credentials, DefaultDirectoryManager),
                                         testEditMode?: EditMode): HandleCommand<UnleashPhilParameters> {

    // console.log("RepoFinder = " + repoFinder + ", RepoLoader = " + repoLoader + ", editMode=" + testEditMode);
    return editorHandler<UnleashPhilParameters>(
        params => setSpringBootVersionEditor(params.desiredBootVersion),
        UnleashPhilParameters,
        "SpringBootVersionUpgrade", {
            repoFinder,
            repoLoader,
            description: "Upgrade versions of Spring Boot across an org",
            intent: "upgrade spring boot version",
            editMode: testEditMode || (params => new PullRequest(
                "spring-boot-" + params.desiredBootVersion + "-" + Date.now(),
                "Upgrade Spring Boot to " + params.desiredBootVersion)),
        });
}
