import { MappedParameters, RedirectResult, Secrets } from "@atomist/automation-client";
import { MappedParameter, Secret } from "@atomist/automation-client/decorators";
import { HandlerContext } from "@atomist/automation-client/HandlerContext";
import { RepoId } from "@atomist/automation-client/operations/common/RepoId";
import { generate } from "@atomist/automation-client/operations/generate/generatorUtils";
import { GitHubProjectPersister } from "@atomist/automation-client/operations/generate/gitHubProjectPersister";
import { SeedDrivenGenerator } from "@atomist/automation-client/operations/generate/SeedDrivenGenerator";

/**
 * Creates a GitHub Repo and installs Atomist collaborator if necessary
 */
export abstract class AbstractRepoCreator extends SeedDrivenGenerator implements RepoId {

    @Secret(Secrets.userToken(["repo", "user"]))
    protected githubToken;

    @MappedParameter(MappedParameters.GitHubOwner)
    public targetOwner: string;

    get owner() {
        return this.targetOwner;
    }

    get repo() {
        return this.targetRepo;
    }

    public handle(ctx: HandlerContext, params: this): Promise<RedirectResult> {
        return ctx.messageClient.respond(`Starting project generation for ${params.targetOwner}/${params.targetRepo}`)
            .then(() => generate(
                this.startingPoint(ctx, this).then(p => {
                    return ctx.messageClient.respond(`Cloned seed project from ${params.sourceOwner}/${params.sourceRepo}`)
                        .then(() => p);
                }),
                ctx,
                {token: params.githubToken},
                params.projectEditor(ctx, params),
                GitHubProjectPersister,
                params)
                .then(r => {
                    return ctx.messageClient.respond(`Created and pushed new project`)
                        .then(() => r);
                }))
                .then( r => ctx.messageClient.respond(`Successfully created new project`)
                    .then(() => r))
                .then(r => ({
                    code: 0,
                    // Redirect to our local project page
                    redirect: `/projects/github/${params.targetOwner}/${params.targetRepo}`,
                }));
    }

}
