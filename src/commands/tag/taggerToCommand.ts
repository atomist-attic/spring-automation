import { EditorOrReviewerParameters } from "@atomist/automation-client/operations/common/params/BaseEditorOrReviewerParameters";
import { CommandDetails } from "@atomist/automation-client/operations/CommandDetails";
import { AllRepos, andFilter, RepoFilter } from "@atomist/automation-client/operations/common/repoFilter";
import { Project } from "@atomist/automation-client/project/Project";
import { HandleCommand, HandlerContext } from "@atomist/automation-client";
import { commandHandlerFrom, OnCommand, ParametersConstructor } from "@atomist/automation-client/onCommand";
import { RepoFinder } from "@atomist/automation-client/operations/common/repoFinder";
import { ProjectOperationCredentials } from "@atomist/automation-client/operations/common/ProjectOperationCredentials";
import { allReposInTeam } from "@atomist/automation-client/operations/common/allReposInTeamRepoFinder";
import { RepoLoader } from "@atomist/automation-client/operations/common/repoLoader";
import { defaultRepoLoader } from "@atomist/automation-client/operations/common/defaultRepoLoader";
import { doWithAllRepos } from "@atomist/automation-client/operations/common/repoUtils";
import { ActionResult } from "@atomist/automation-client/action/ActionResult";

export interface Tags {

    tags: string[];
}

export type Tagger<P extends EditorOrReviewerParameters = EditorOrReviewerParameters> =
    (p: Project, context: HandlerContext, params?: P) => Promise<Tags>;

export type TagRouter = (tags: Tags, ctx: HandlerContext) => Promise<ActionResult<Tags>>;

export interface TaggerCommandDetails<PARAMS extends EditorOrReviewerParameters> extends CommandDetails<PARAMS> {

    tagRouter: TagRouter;

    repoFilter?: RepoFilter;

}

function defaultDetails(name: string): TaggerCommandDetails<EditorOrReviewerParameters> {
    return {
        tagRouter: MessageClientTagRouter,
        description: name,
    };
}

const MessageClientTagRouter: TagRouter = (tags, ctx) =>
    ctx.messageClient.respond("Tags: " + tags.tags.join());

/**
 * Create a handle function that reviews one or many repos, following AllReposByDefaultParameters
 * @param {ParametersConstructor<PARAMS>} factory
 * @param {string} name
 * @param {string} details object allowing customization beyond reasonable defaults
 * @return {HandleCommand}
 */
export function taggerHandler<PARAMS extends EditorOrReviewerParameters>(tagger: Tagger<PARAMS>,
                                                                         factory: ParametersConstructor<PARAMS>,
                                                                         name: string,
                                                                         details: Partial<TaggerCommandDetails<PARAMS>> = {}): HandleCommand {
    const detailsToUse: TaggerCommandDetails<PARAMS> = {
        ...defaultDetails(name),
        ...details,
    };
    return commandHandlerFrom(tagOneOrMany(tagger, name, detailsToUse),
        factory,
        name,
        detailsToUse.description, detailsToUse.intent, detailsToUse.tags);
}

/**
 * If owner and repo are required, review just one repo. Otherwise review all repos
 * in the present team
 */
function tagOneOrMany<PARAMS extends EditorOrReviewerParameters>(tagger: Tagger<PARAMS>,
                                                                 name: string,
                                                                 details: TaggerCommandDetails<PARAMS>): OnCommand<PARAMS> {
    return (ctx: HandlerContext, parameters: PARAMS) => {
        const credentials = {token: parameters.targets.githubToken};
        const repoFinder: RepoFinder = parameters.targets.repoRef ?
            () => Promise.resolve([parameters.targets.repoRef]) :
            details.repoFinder;
        return tagAll(ctx, credentials, tagger, parameters,
            repoFinder,
            andFilter(parameters.targets.test, details.repoFilter),
            !!details.repoLoader ? details.repoLoader(parameters) : undefined)
            .then((tags: Tags[]) => {
                return Promise.all(tags
                    .filter(pr => tags.length > 0)
                    .map(t => details.tagRouter(t, ctx)));
            });
    };
}

function tagAll<P extends EditorOrReviewerParameters>(ctx: HandlerContext,
                                                      credentials: ProjectOperationCredentials,
                                                      tagger: Tagger<P>,
                                                      parameters?: P,
                                                      repoFinder: RepoFinder = allReposInTeam(),
                                                      repoFilter: RepoFilter = AllRepos,
                                                      repoLoader: RepoLoader =
                                                          defaultRepoLoader(
                                                              credentials)): Promise<Tags[]> {
    return doWithAllRepos(ctx, credentials,
        p => tagger(p, ctx, parameters), parameters,
        repoFinder, repoFilter, repoLoader);
}

