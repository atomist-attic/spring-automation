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
import { ProjectReviewer } from "@atomist/automation-client/operations/review/projectReviewer";
import { reviewerHandler, ReviewRouter } from "@atomist/automation-client/operations/review/reviewerToCommand";
import { clean, Severity } from "@atomist/automation-client/operations/review/ReviewResult";
import { findMatches } from "@atomist/automation-client/project/util/parseUtils";
import { ParentStanzaGrammar } from "../../../grammars/mavenGrammars";
import { FallbackReposParameters } from "../../editor/FallbackReposParameters";
import { SpringBootReviewerTags, SpringBootStarter } from "../../editor/spring/springConstants";

export const CurrentSpringBootVersion = "1.5.9.RELEASE";

@Parameters()
export class SpringBootVersionReviewerParameters extends BaseEditorOrReviewerParameters {

    constructor() {
        super(new FallbackReposParameters());
    }

    @Parameter({
        displayName: "Desired Spring Boot version",
        description: "The desired Spring Boot version across these repos",
        pattern: /^.+$/,
        validInput: "Semantic version",
        required: false,
    })
    public desiredBootVersion: string = CurrentSpringBootVersion;

}

export function springBootVersionReviewerCommand(reviewRouter?: ReviewRouter<SpringBootVersionReviewerParameters>): HandleCommand {
    return reviewerHandler(() => springBootVersionReviewer,
        SpringBootVersionReviewerParameters,
        "SpringBootVersionReviewer",
        {
            description: "Reviewer that flags old versions of Spring Boot",
            tags: SpringBootReviewerTags,
            intent: "review spring boot version",
            reviewRouter,
        },
    );
}

export const springBootVersionReviewer: ProjectReviewer<SpringBootVersionReviewerParameters> =
    (p, context, params) => {
        return findMatches(p, "pom.xml", ParentStanzaGrammar)
            .then(matches => {
                if (matches.length > 0 && matches[0].gav.artifact === SpringBootStarter) {
                    const version = matches[0].gav.version;
                    const outDated = version !== params.desiredBootVersion;
                    if (outDated) {
                        const detail = `Old version of Spring Boot: [${version}] - ` +
                            `should have been [${params.desiredBootVersion}]`;
                        return Promise.resolve({
                            repoId: p.id,
                            comments: [
                                {
                                    severity: "warn" as Severity,
                                    category: "Spring Boot version",
                                    detail,
                                    sourceLocation: {
                                        path: "pom.xml",
                                        offset: 0,
                                    },
                                    fix: {
                                        command: "SpringBootVersionUpgrade",
                                        params: {
                                            "targets.owner": p.id.owner,
                                            "targets.repo": p.id.repo,
                                        },
                                    },
                                },
                            ],
                            version,
                            desiredVersion: params.desiredBootVersion,
                        });
                    }
                }
                return Promise.resolve(clean(p.id));
            });
    };
