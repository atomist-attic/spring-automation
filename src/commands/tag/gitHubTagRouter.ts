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

import { logger } from "@atomist/automation-client";
import { GitHubRepoRef, isGitHubRepoRef } from "@atomist/automation-client/operations/common/GitHubRepoRef";

import { successOn } from "@atomist/automation-client/action/ActionResult";
import axios, { AxiosRequestConfig } from "axios";

import { TokenCredentials } from "@atomist/automation-client/operations/common/ProjectOperationCredentials";
import { TagRouter } from "@atomist/automation-client/operations/tagger/Tagger";
import * as _ from "lodash";

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
