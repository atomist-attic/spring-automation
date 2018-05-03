/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { HandleCommand } from "@atomist/automation-client";
import { AnyProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { chainEditors } from "@atomist/automation-client/operations/edit/projectEditorOps";
import { generatorHandler } from "@atomist/automation-client/operations/generate/generatorToCommand";
import { ProjectPersister } from "@atomist/automation-client/operations/generate/generatorUtils";
import { GitHubProjectPersister } from "@atomist/automation-client/operations/generate/gitHubProjectPersister";
import { cleanReadMe } from "@atomist/automation-client/operations/generate/UniversalSeed";
import { curry } from "@typed/curry";
import { cleanTravisBuildFiles, doUpdatePom, inferStructureAndMovePackage } from "../java/JavaProjectParameters";
import { inferSpringStructureAndRename, SpringBootGeneratorParameters } from "./SpringBootProjectParameters";

/**
 * Handle Java and Kotlin seeds
 * @param {ProjectPersister} projectPersister
 * @return {HandleCommand<SpringBootGeneratorParameters>}
 */
export function springBootGenerator(projectPersister: ProjectPersister = GitHubProjectPersister): HandleCommand<SpringBootGeneratorParameters> {
    return generatorHandler<SpringBootGeneratorParameters>(
        springBootProjectEditor,
        SpringBootGeneratorParameters,
        "springBootGenerator",
        {
            intent: "generate spring",
            tags: ["spring", "boot", "java"],
            projectPersister,
        });
}

export function springBootProjectEditor(params: SpringBootGeneratorParameters): AnyProjectEditor<SpringBootGeneratorParameters> {
    const editors: Array<AnyProjectEditor<SpringBootGeneratorParameters>> = [
        curry(cleanReadMe)(params.target.description),
        curry(cleanTravisBuildFiles)(slackTeamTravisWebhookUrl(params.slackTeam)),
        curry(doUpdatePom)(params),
        curry(inferStructureAndMovePackage)(params.rootPackage),
        curry(inferSpringStructureAndRename)(params.serviceClassName),
    ];
    return chainEditors(...editors);
}

function slackTeamTravisWebhookUrl(teamId: string): string {
    return `https://webhook.atomist.com/atomist/travis/teams/${teamId}`;
}
