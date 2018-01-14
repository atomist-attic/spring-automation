import { HandleCommand } from "@atomist/automation-client";
import { allReposInTeam } from "@atomist/automation-client/operations/common/allReposInTeamRepoFinder";
import { gitHubRepoLoader } from "@atomist/automation-client/operations/common/gitHubRepoLoader";
import { TokenCredentials } from "@atomist/automation-client/operations/common/ProjectOperationCredentials";
import { RepoFinder } from "@atomist/automation-client/operations/common/repoFinder";
import { RepoLoader } from "@atomist/automation-client/operations/common/repoLoader";
import { EditMode, PullRequest } from "@atomist/automation-client/operations/edit/editModes";
import { editorHandler } from "@atomist/automation-client/operations/edit/editorToCommand";
import { DefaultDirectoryManager } from "@atomist/automation-client/project/git/GitCommandGitProject";
import { setSpringBootVersionEditor } from "./setSpringBootVersionEditor";
import { UnleashPhilParameters } from "./unleashPhil";

/**
 * Upgrade the version of Spring Boot projects to a desired version
 */
export function springBootVersionUpgrade(repoFinder: RepoFinder = allReposInTeam(),
                                         repoLoader: (p: UnleashPhilParameters) => RepoLoader =
                                             p => gitHubRepoLoader({
                                                 token: (p.targets.credentials as TokenCredentials).token,
                                             }, DefaultDirectoryManager),
                                         testEditMode?: EditMode): HandleCommand<UnleashPhilParameters> {

    // console.log("RepoFinder = " + repoFinder + ", RepoLoader = " + repoLoader + ", editMode=" + testEditMode);
    return editorHandler<UnleashPhilParameters>(
        params => setSpringBootVersionEditor(params.desiredBootVersion),
        UnleashPhilParameters,
        "SpringBootVersionUpgrade", {
            repoFinder,
            repoLoader,
            description: "Upgrade versions of Spring Boot across an org",
            intent: "upgrade spring boot version",
            editMode: testEditMode || (params => new PullRequest(
                "spring-boot-" + params.desiredBootVersion + "-" + Date.now(),
                "Upgrade Spring Boot to " + params.desiredBootVersion)),
        });
}
