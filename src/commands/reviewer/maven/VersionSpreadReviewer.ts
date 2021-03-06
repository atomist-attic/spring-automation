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
import { Parameter, Parameters } from "@atomist/automation-client/decorators";
import { BaseEditorOrReviewerParameters } from "@atomist/automation-client/operations/common/params/BaseEditorOrReviewerParameters";
import { RepoFinder } from "@atomist/automation-client/operations/common/repoFinder";
import { RepoLoader } from "@atomist/automation-client/operations/common/repoLoader";
import { ProjectReviewer } from "@atomist/automation-client/operations/review/projectReviewer";
import { reviewerHandler } from "@atomist/automation-client/operations/review/reviewerToCommand";
import { clean, ProjectReview } from "@atomist/automation-client/operations/review/ReviewResult";
import { findMatches } from "@atomist/automation-client/project/util/parseUtils";
import { dependencyOfGrammar } from "../../../grammars/mavenGrammars";
import { VersionedArtifact } from "../../../grammars/VersionedArtifact";
import { SpringBootReviewerTags } from "../../editor/spring/springConstants";

@Parameters()
export class VersionSpreadReviewerParameters extends BaseEditorOrReviewerParameters {

    @Parameter({
        displayName: "Maven Group ID",
        description: "Maven group identifier",
        pattern: /^.*$/,
        validInput: "a valid Maven group ID, which starts with a letter, -, or _ and contains only" +
        " alphanumeric, -, and _ characters and may having leading period separated identifiers starting" +
        " with letters or underscores and containing only alphanumeric and _ characters.",
        minLength: 1,
        maxLength: 50,
        required: true,
    })
    public groupId: string;

    @Parameter({
        displayName: "Maven Artifact ID",
        description: "Maven artifact identifier we are looking for",
        pattern: /^[a-z][-a-z0-9_]*$/,
        validInput: "a valid Maven artifact ID, which starts with a lower-case letter and contains only " +
        " alphanumeric, -, and _ characters",
        minLength: 1,
        maxLength: 50,
        required: true,
    })
    public artifactId: string;

}

export function versionSpreadReviewerCommand(repoFinder?: RepoFinder, repoLoader?: RepoLoader): HandleCommand {
    return reviewerHandler(() => versionSpreadProjectReviewer,
        VersionSpreadReviewerParameters,
        "SpringBootVersionReviewer",
        {
            description: "Reviewer that reports the range of versions of an artifact",
            tags: SpringBootReviewerTags,
            intent: "version spread",
            repoFinder,
            repoLoader: repoLoader ? () => repoLoader : undefined,
        },
    );
}

const versionSpreadProjectReviewer: ProjectReviewer<VersionSpreadReviewerParameters, VersionReportReview> =
    (p, ctx, params) => {
        return findMatches(p, "pom.xml",
            dependencyOfGrammar(params.groupId, params.artifactId))
            .then(matches => {
                if (matches.length > 0) {
                    const version = matches[0].gav.version;
                    return Promise.resolve({
                        repoId: p.id,
                        comments: [],
                        group: params.groupId,
                        artifact: params.artifactId,
                        version,
                    });
                }
                return Promise.resolve(clean(p.id) as VersionReportReview);
            });
    };

export interface VersionReportReview extends ProjectReview, VersionedArtifact {

}
