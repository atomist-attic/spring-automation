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

import { CommandHandler, HandleCommand, HandlerContext, HandlerResult, Parameter } from "@atomist/automation-client";
import {
    BaseEditorOrReviewerParameters,
    EditorOrReviewerParameters,
} from "@atomist/automation-client/operations/common/params/BaseEditorOrReviewerParameters";
import { GitHubTargetsParams } from "@atomist/automation-client/operations/common/params/GitHubTargetsParams";
import { MappedRepoParameters } from "@atomist/automation-client/operations/common/params/MappedRepoParameters";
import { RepoFinder } from "@atomist/automation-client/operations/common/repoFinder";
import { editAll } from "@atomist/automation-client/operations/edit/editAll";
import { PullRequest } from "@atomist/automation-client/operations/edit/editModes";
import { setSpringBootVersionEditor } from "./setSpringBootVersionEditor";

@CommandHandler("update spring boot version on all created repos",
    "upgrade boot repos")
export class UpgradeCreatedRepos implements HandleCommand, EditorOrReviewerParameters {

    @Parameter({
        displayName: "Desired Spring Boot version",
        description: "The desired Spring Boot version across these repos",
        pattern: /^.+$/,
        validInput: "Semantic version",
        required: true,
    })
    public desiredBootVersion: string;

    public targets: GitHubTargetsParams = new MappedRepoParameters();

    constructor(private repoFinder: RepoFinder, private collaboratorToken: string) {
    }

    public handle(context: HandlerContext, params: this): Promise<HandlerResult> {
        return Promise.resolve(setSpringBootVersionEditor(params.desiredBootVersion))
            .then(pe =>
                editAll(context,
                    {token: params.collaboratorToken},
                    pe,
                    new PullRequest(`atomist-boot-${params.desiredBootVersion}`,
                        `Upgrade Spring Boot to ${params.desiredBootVersion}`),
                    this,
                    params.repoFinder))
            .then(edits => {
                return {
                    code: 0,
                    reposEdited: edits.filter(e => e.edited).length,
                    reposSeen: edits.length,
                };
            });
    }

}
