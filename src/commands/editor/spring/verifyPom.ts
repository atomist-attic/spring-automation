import { HandleCommand } from "@atomist/automation-client";
import { BaseEditorParameters } from "@atomist/automation-client/operations/edit/BaseEditorParameters";
import { reviewerHandler, ReviewRouter } from "@atomist/automation-client/operations/review/reviewerToCommand";
import { clean, ProjectReview } from "@atomist/automation-client/operations/review/ReviewResult";
import { Project } from "@atomist/automation-client/project/Project";
import { promisify } from "util";
import { SpringBootStarter, SpringBootTags } from "./springConstants";

import * as _ from "lodash";
import { MessagingReviewRouter } from "../../messagingReviewRouter";

const xml2js = require("xml2js");

/**
 * Find all non specific, old style @RequestMapping annotations
 * @param {Project} p project to search
 * location of source tree.
 */
export function verifyPom(p: Project): Promise<ProjectReview> {
    return p.findFile("pom.xml")
        .then(f => f.getContent())
        .then(content => {
                if (!content.includes("spring-boot")) {
                    // We don't care if it doesn't use Spring Boot at all
                    return clean(p.id);
                }
                const parser = new xml2js.Parser();
                return promisify(parser.parseString)(content)
                    .then(parsed => {
                        const parent = _.get(parsed, "project.parent");
                        if (JSON.stringify(parent).includes(SpringBootStarter)) {
                            return clean(p.id);
                        }

                        // TODO check dependency management block also
                        return {
                            repoId: p.id,
                            comments: [
                                {
                                    severity: "warn",
                                    comment: `POM should extend ${SpringBootStarter} or use Spring Boot dependency management`,
                                    sourceLocation: {path: "pom.xml", offset: -1},
                                }],
                        };
                    });
            },
        ).catch(err => {
            return clean(p.id);
        });
}

export function verifyPomCommand(reviewRouter: ReviewRouter<any> = MessagingReviewRouter): HandleCommand {
    return reviewerHandler(() => verifyPom,
        BaseEditorParameters,
        "VerifyPOM",
        {
            tags: SpringBootTags,
            intent: "verify pom",
            reviewRouter,
        },
    );
}
