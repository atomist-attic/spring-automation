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

import { JavaFileParser } from "@atomist/antlr/tree/ast/antlr/java/JavaFileParser";
import { HandleCommand } from "@atomist/automation-client";
import { BaseEditorOrReviewerParameters } from "@atomist/automation-client/operations/common/params/BaseEditorOrReviewerParameters";
import { SourceLocation } from "@atomist/automation-client/operations/common/SourceLocation";
import { reviewerHandler, ReviewRouter } from "@atomist/automation-client/operations/review/reviewerToCommand";
import { ProjectReview, ReviewComment, Severity } from "@atomist/automation-client/operations/review/ReviewResult";
import { Project } from "@atomist/automation-client/project/Project";
import { findMatches } from "@atomist/automation-client/tree/ast/astUtils";
import { JavaSourceFiles } from "../../generator/java/javaProjectUtils";
import { MessagingReviewRouter } from "../../messagingReviewRouter";
import { SpringBootReviewerTags } from "./springConstants";

export class NonSpecificMvcAnnotation implements ReviewComment {

    public severity: Severity = "info";
    public category = "Old style MVC annotation";

    constructor(public raw: string, public sourceLocation: SourceLocation) {
    }

    get detail() {
        return `Old style Spring MVC \`@RequestAnnotation\`: Use specific mapping`;
    }
}

const RequestMappingAnnotation = `//annotation[//annotationName[@value='RequestMapping']]`;

const globPattern: string = JavaSourceFiles;

/**
 * Find all non specific, old style @RequestMapping annotations
 * @param {Project} p project to search
 * location of source tree.
 */
export function findNonSpecificMvcAnnotations(p: Project): Promise<ProjectReview> {
    return findMatches(p, JavaFileParser, globPattern, RequestMappingAnnotation)
        .then(fileHits => ({
            repoId: p.id,
            comments: fileHits.map(m => new NonSpecificMvcAnnotation(
                m.$value,
                m.sourceLocation)),
        }));
}

export function findNonSpecificMvcAnnotationsCommand(reviewRouter: ReviewRouter<any> = MessagingReviewRouter): HandleCommand {
    return reviewerHandler(() => findNonSpecificMvcAnnotations,
        BaseEditorOrReviewerParameters,
        "FindNonSpecificMvcAnnotations",
        {
            tags: SpringBootReviewerTags,
            intent: "review mvc",
            reviewRouter,
        },
    );
}
