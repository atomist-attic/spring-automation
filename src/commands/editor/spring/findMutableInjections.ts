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
import { findMatches } from "@atomist/automation-client/tree/ast/astUtils";
import { JavaSourceFiles } from "../../generator/java/javaProjectUtils";

import { HandleCommand } from "@atomist/automation-client";
import { BaseEditorOrReviewerParameters } from "@atomist/automation-client/operations/common/params/BaseEditorOrReviewerParameters";
import { SourceLocation } from "@atomist/automation-client/operations/common/SourceLocation";
import { reviewerHandler, ReviewRouter } from "@atomist/automation-client/operations/review/reviewerToCommand";
import { ProjectReview, ReviewComment, Severity } from "@atomist/automation-client/operations/review/ReviewResult";
import { Project } from "@atomist/automation-client/project/Project";
import { MessagingReviewRouter } from "../../messagingReviewRouter";
import { SpringBootReviewerTags } from "./springConstants";

export class MutableInjection implements ReviewComment {

    public severity: Severity = "warn";
    public category = "Mutable injection";

    constructor(public name: string, public type: "field" | "setter",
                public sourceLocation: SourceLocation) {
    }

    get detail() {
        return `Improper Spring injection: Mutable ${this.type} ${this.name} is injected`;
    }

}

// TODO will eventually use OR predicates - for @Inject
const InjectedFields = `//classBodyDeclaration[//annotation[@value='@Autowired']]
                            //fieldDeclaration//variableDeclaratorId |
                         //classBodyDeclaration[//annotation[@value='@Inject']]
                            //fieldDeclaration//variableDeclaratorId |
                         //classBodyDeclaration[//annotation[@value='@Autowired']]
                            //methodDeclaration//Identifier[1] |
                         //classBodyDeclaration[//annotation[@value='@Inject']]
                            //methodDeclaration//Identifier[1]`;

const globPattern: string = JavaSourceFiles;

/**
 * Find all fields or setters annotated with @Autowired or @Inject in the codebase.
 * This is an undesirable usage pattern in application code, although
 * acceptable in tests.
 * @param {Project} p project to search
 * location of source tree.
 */
export function findMutableInjections(p: Project): Promise<ProjectReview> {
    return findMatches(p, JavaFileParser, globPattern, InjectedFields)
        .then(fileHits => {
            const comments = fileHits.map(m => new MutableInjection(
                m.$value,
                m.$value.startsWith("set") ? "setter" : "field",
                m.sourceLocation));
            return {
                repoId: p.id,
                comments,
            };
        });
}

export function findMutableInjectionsCommand(reviewRouter: ReviewRouter<any> = MessagingReviewRouter): HandleCommand {
    return reviewerHandler(() => findMutableInjections,
        BaseEditorOrReviewerParameters,
        "FindMutableInjections",
        {
            tags: SpringBootReviewerTags,
            intent: "find mutable injections",
            reviewRouter,
        },
    );
}
