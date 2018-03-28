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

import { JavaFileParser } from "@atomist/antlr/tree/ast/antlr/java/JavaFileParser";
import { SimpleProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { findMatches, zapAllMatches } from "@atomist/automation-client/tree/ast/astUtils";

import { HandleCommand } from "@atomist/automation-client";
import { BaseEditorOrReviewerParameters } from "@atomist/automation-client/operations/common/params/BaseEditorOrReviewerParameters";
import { PullRequest } from "@atomist/automation-client/operations/edit/editModes";
import { editorHandler } from "@atomist/automation-client/operations/edit/editorToCommand";
import { ProjectReviewer } from "@atomist/automation-client/operations/review/projectReviewer";
import { reviewerHandler, ReviewRouter } from "@atomist/automation-client/operations/review/reviewerToCommand";
import { DefaultReviewComment } from "@atomist/automation-client/operations/review/ReviewResult";
import { ZapTrailingWhitespace } from "@atomist/automation-client/tree/ast/FileHits";
import { JavaSourceFiles } from "../../generator/java/javaProjectUtils";
import { MessagingReviewRouter } from "../../messagingReviewRouter";
import { SpringBootEditorTags, SpringBootReviewerTags } from "./springConstants";

const UnnecessaryComponentScanAnnotations = `//typeDeclaration[/classDeclaration]
                            [//annotation[@value='@SpringBootApplication']]
                            //annotation[@value='@ComponentScan']`;

export const removeUnnecessaryComponentScanEditor: SimpleProjectEditor = p => {
    return zapAllMatches(p, JavaFileParser, JavaSourceFiles,
        UnnecessaryComponentScanAnnotations,
        ZapTrailingWhitespace);
};

export function findUnnecessaryComponentScanReviewerCommand(reviewRouter: ReviewRouter<any> = MessagingReviewRouter): HandleCommand {
    return reviewerHandler(() => unnecessaryComponentScanReviewer,
        BaseEditorOrReviewerParameters,
        "UnnecessaryComponentScanAnnotationReviewer", {
            description: "Find unnecessary component scan annotations",
            intent: "find unnecessary component scan",
            tags: SpringBootReviewerTags,
            reviewRouter,
        },
    );
}

export const unnecessaryComponentScanReviewer: ProjectReviewer<any> = p => {
    return findMatches(p, JavaFileParser, JavaSourceFiles,
        UnnecessaryComponentScanAnnotations)
        .then(matches => {
            return {
                repoId: p.id,
                comments: matches.map(m => {
                    return new DefaultReviewComment("info", "unnecessary annotations",
                        "`@ComponentScan` annotations are not necessary on `@SpringBootApplication` classes as they are inherited",
                        m.sourceLocation,
                        {
                            command: "RemoveUnnecessaryComponentScanAnnotations",
                            params: {
                                "target.owner": p.id.owner,
                                "target.repo": p.id.repo,
                            },
                        });
                }),
            };
        });
};

export const removeUnnecessaryComponentScanCommand: HandleCommand =
    editorHandler(() => removeUnnecessaryComponentScanEditor,
        BaseEditorOrReviewerParameters,
        "RemoveUnnecessaryComponentScanAnnotations", {
            description: "Remove unnecessary component scan annotations",
            editMode: () => new PullRequest("remove-unnecessary-component-scan-" + Date.now(),
                "Remove unnecessary component scan annotations",
                "`@ComponentScan` annotations are not necessary on `@SpringBootApplication` classes as they are inherited"),
            intent: "remove unnecessary component scan",
            tags: SpringBootEditorTags,
        },
    );
