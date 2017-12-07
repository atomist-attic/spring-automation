import { HandleCommand, Parameter } from "@atomist/automation-client";
import { Parameters } from "@atomist/automation-client/decorators";
import { allReposInTeam } from "@atomist/automation-client/operations/common/allReposInTeamRepoFinder";
import { gitHubRepoLoader } from "@atomist/automation-client/operations/common/gitHubRepoLoader";
import { BaseEditorOrReviewerParameters } from "@atomist/automation-client/operations/common/params/BaseEditorOrReviewerParameters";
import { RepoFinder } from "@atomist/automation-client/operations/common/repoFinder";
import { RepoLoader } from "@atomist/automation-client/operations/common/repoLoader";
import { EditMode, PullRequest } from "@atomist/automation-client/operations/edit/editModes";
import { editorHandler } from "@atomist/automation-client/operations/edit/editorToCommand";
import { DefaultDirectoryManager } from "@atomist/automation-client/project/git/GitCommandGitProject";
import { CurrentSpringBootVersion } from "../../reviewer/spring/SpringBootVersionReviewer";
import { FallbackReposParameters } from "../FallbackReposParameters";
import { setSpringBootVersionEditor } from "./setSpringBootVersionEditor";

@Parameters()
export class SpringBootVersionUpgradeParameters extends BaseEditorOrReviewerParameters {

    constructor() {
        super(new FallbackReposParameters());
    }

    @Parameter({
        displayName: "Desired Spring Boot version",
        description: "The desired Spring Boot version across these repos",
        pattern: /^.+$/,
        validInput: "Semantic version",
        required: false,
    })
    public desiredBootVersion: string = CurrentSpringBootVersion;

}

/**
 * Upgrade the version of Spring Boot projects to a desired version
 */
export function springBootVersionUpgrade(repoFinder: RepoFinder = allReposInTeam(),
                                         repoLoader: (p: SpringBootVersionUpgradeParameters) => RepoLoader =
                                             p => gitHubRepoLoader({token: p.targets.githubToken}, DefaultDirectoryManager),
                                         testEditMode?: EditMode): HandleCommand<SpringBootVersionUpgradeParameters> {

    console.log("RepoFinder = " + repoFinder + ", RepoLoader = " + repoLoader + ", editMode=" + testEditMode);
    return editorHandler<SpringBootVersionUpgradeParameters>(
        params => setSpringBootVersionEditor(params.desiredBootVersion),
        SpringBootVersionUpgradeParameters,
        "SpringBootVersionUpgrade", {
            repoFinder,
            repoLoader,
            description: "Upgrade versions of Spring Boot across an org",
            intent: "upgrade spring boot version",
            editMode: testEditMode || (params => new PullRequest(
                "spring-boot-" + params.desiredBootVersion,
                "Upgrade Spring Boot to " + params.desiredBootVersion)),
        });
}
