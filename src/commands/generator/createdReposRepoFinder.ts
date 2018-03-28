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

import { HandlerContext } from "@atomist/automation-client/Handlers";
import { isGitHubRepoRef } from "@atomist/automation-client/operations/common/GitHubRepoRef";
import { RepoFinder } from "@atomist/automation-client/operations/common/repoFinder";

// export const ReposWeMadeRepoFinder: RepoFinder =
//     (context: HandlerContext) => {
//         return Promise.resolve(
//             InMemoryStore.all()
//                 .filter(o => isGitHubRepoRef(o)),
//         );
//     };
