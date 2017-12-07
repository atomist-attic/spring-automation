import { HandleCommand, logger } from "@atomist/automation-client";
import { GitHubRepoRef, isGitHubRepoRef } from "@atomist/automation-client/operations/common/GitHubRepoRef";
import { BaseEditorOrReviewerParameters } from "@atomist/automation-client/operations/common/params/BaseEditorOrReviewerParameters";
import { SpringBootStarter, SpringBootTaggerTags } from "../editor/spring/springConstants";

import { successOn } from "@atomist/automation-client/action/ActionResult";
import axios, { AxiosPromise, AxiosRequestConfig } from "axios";

import { DefaultTags } from "@atomist/automation-client/operations/tagger/Tagger";
import { TagRouter } from "@atomist/automation-client/operations/tagger/Tagger";
import { taggerHandler } from "@atomist/automation-client/operations/tagger/taggerHandler";
import { toPromise } from "@atomist/automation-client/project/util/projectUtils";
import { AllJavaFiles } from "../generator/java/javaProjectUtils";

import * as _ from "underscore";

/**
 * Persist tags to GitHub
 * @param {Tags} tags
 * @param {PARAMS} params
 * @return {Promise<ActionResult<Tags>>}
 * @constructor
 */
export const GitHubTagRouter: TagRouter = (tags, params) => {
    const grr = isGitHubRepoRef(tags.repoId) ? tags.repoId : new GitHubRepoRef(tags.repoId.owner, tags.repoId.repo, tags.repoId.sha);
    const url = `${grr.apiBase}/repos/${grr.owner}/${grr.repo}/topics`;
    logger.debug(`Request to '${url}' to raise tags: [${tags.tags.join()}]`);
    return axios.put(url, {names: _.uniq(tags.tags)},
        // Mix in custom media type for
        {
            headers: {
                ...authHeaders(params.targets.githubToken).headers,
                Accept: "application/vnd.github.mercy-preview+json",
            },
        },
    )
        .then(x => successOn(tags));
};

function authHeaders(token: string): AxiosRequestConfig {
    return token ? {
            headers: {
                Authorization: `token ${token}`,
            },
        }
        : {};
}

export const springBootTagger = p => {
    return p.findFile("pom.xml")
        .then(f => f.getContent())
        .then(content => {
            const tags: string[] = [];
            if (content.includes(SpringBootStarter)) {
                tags.push("spring-boot");
                tags.push("spring");
            }
            if (content.includes("org.springframework")) {
                tags.push("spring");
            }
            // TODO need to simplify this
            return toPromise(p.streamFiles(AllJavaFiles))
                .then(javaFiles => {
                    if (javaFiles.length > 0) {
                        tags.push("java");
                    }
                    return new DefaultTags(p.id, tags);
                });
        })
        .catch(err => {
            console.log("Tag error: " + err);
            return new DefaultTags(p.id, []);
        });
};

export function springBootTaggerCommand(tagRouter: TagRouter = GitHubTagRouter): HandleCommand {
    return taggerHandler(springBootTagger,
        BaseEditorOrReviewerParameters,
        "SpringBootTagger",
        {
            description: "Tag Spring Boot projects",
            tags: SpringBootTaggerTags.concat("tagger"),
            intent: "tag spring",
            tagRouter,
        },
    );
}
