import { logger } from "@atomist/automation-client";
import { GitHubRepoRef, isGitHubRepoRef } from "@atomist/automation-client/operations/common/GitHubRepoRef";

import { successOn } from "@atomist/automation-client/action/ActionResult";
import axios, { AxiosRequestConfig } from "axios";

import { TokenCredentials } from "@atomist/automation-client/operations/common/ProjectOperationCredentials";
import { TagRouter } from "@atomist/automation-client/operations/tagger/Tagger";
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
    const apiBase = grr.apiBase.replace(/\/*$/, "");
    const url = `${apiBase}/repos/${grr.owner}/${grr.repo}/topics`;
    logger.debug(`Request to '${url}' to raise tags: [${tags.tags.join()}]`);
    return axios.put(url, { names: _.uniq(tags.tags) },
        // Mix in custom media type for
        {
            headers: {
                ...authHeaders((params.targets.credentials as TokenCredentials).token).headers,
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
