import { HandleCommand } from "@atomist/automation-client/HandleCommand";
import { CommandHandler, Parameter } from "@atomist/automation-client/decorators";
import { HandlerContext } from "@atomist/automation-client/HandlerContext";
import { HandlerResult } from "@atomist/automation-client/HandlerResult";
import { editAll } from "@atomist/automation-client/operations/edit/editAll";
import { setSpringBootVersionEditor } from "./setSpringBootVersionEditor";
import { RepoFinder } from "@atomist/automation-client/operations/common/repoFinder";
import { PullRequest } from "@atomist/automation-client/operations/edit/editModes";

@CommandHandler("update spring boot version on all created repos",
    "upgrade boot repos")
export class UpgradeCreatedRepos implements HandleCommand {

    @Parameter({
        displayName: "Desired Spring Boot version",
        description: "The desired Spring Boot version across these repos",
        pattern: /^.+$/,
        validInput: "Semantic version",
        required: true,
    })
    public desiredBootVersion: string;

    constructor(private repoFinder: RepoFinder, private collaboratorToken: string) {
    }

    public handle(context: HandlerContext, params: this): Promise<HandlerResult> {
        return Promise.resolve(setSpringBootVersionEditor(params.desiredBootVersion))
            .then(pe =>
                editAll(context,
                    {token: params.collaboratorToken},
                    pe,
                    new PullRequest(`atomist-boot-${params.desiredBootVersion}`,
                        `Upgrade Spring Boot to ${params.desiredBootVersion}`),
                    this,
                    params.repoFinder))
            .then(edits => {
                return {
                    code: 0,
                    reposEdited: edits.filter(e => e.edited).length,
                    reposSeen: edits.length,
                };
            });
    }

}