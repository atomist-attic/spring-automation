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
