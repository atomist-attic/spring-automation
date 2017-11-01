

import { HandlerContext } from "@atomist/automation-client/HandlerContext";
import { RepoFinder } from "@atomist/automation-client/operations/common/repoFinder";
import { InMemoryStore } from "../../../web/InMemoryObjectStore";
import { isGitHubRepoRef } from "@atomist/automation-client/operations/common/GitHubRepoRef";

export const ReposWeMadeRepoFinder: RepoFinder =
    (context: HandlerContext) => {
        return Promise.resolve(
            InMemoryStore.all()
                .filter(o => isGitHubRepoRef(o))
        );
    };

