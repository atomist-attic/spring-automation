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

import { MappedParameter, MappedParameters, Parameter } from "@atomist/automation-client";
import { GitBranchRegExp } from "@atomist/automation-client/operations/common/params/gitHubPatterns";
import { GitHubTargetsParams } from "@atomist/automation-client/operations/common/params/GitHubTargetsParams";

/**
 * Resolve from a Mapped parameter or from a supplied repos regex if not found
 */
export class FallbackReposParameters extends GitHubTargetsParams {

    @MappedParameter(MappedParameters.GitHubOwner, false)
    public owner: string;

    @MappedParameter(MappedParameters.GitHubRepository, false)
    public repo: string;

    @Parameter({description: "Branch or ref. Defaults to 'master'", ...GitBranchRegExp, required: false})
    public sha: string;

    @Parameter({description: "regex", required: false})
    public repos: string = ".*";

}
