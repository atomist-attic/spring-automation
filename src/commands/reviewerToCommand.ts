import { HandleCommand, HandlerContext } from "@atomist/automation-client";
import { ActionResult, failureOn, successOn } from "@atomist/automation-client/action/ActionResult";
import { commandHandlerFrom, OnCommand, ParametersConstructor } from "@atomist/automation-client/onCommand";
import { CommandDetails } from "@atomist/automation-client/operations/CommandDetails";
import { GitHubRepoRef, isGitHubRepoRef } from "@atomist/automation-client/operations/common/GitHubRepoRef";
import { RepoFilter } from "@atomist/automation-client/operations/common/repoFilter";
import { RepoFinder } from "@atomist/automation-client/operations/common/repoFinder";
import { RepoRef } from "@atomist/automation-client/operations/common/RepoId";
import { BaseEditorParameters } from "@atomist/automation-client/operations/edit/BaseEditorParameters";
import { ProjectReviewer } from "@atomist/automation-client/operations/review/projectReviewer";
import { reviewAll } from "@atomist/automation-client/operations/review/reviewAll";
import { ProjectReview, ReviewComment } from "@atomist/automation-client/operations/review/ReviewResult";
import { deepLink, Issue, raiseIssue } from "@atomist/automation-client/util/gitHub";

export type ReviewRouter<PARAMS> = (pr: ProjectReview, params: PARAMS, title: string) =>
    Promise<ActionResult<RepoRef>>;

/**
 * Further details of an editor to allow selective customization
 */
export interface ReviewerCommandDetails<PARAMS extends BaseEditorParameters> extends CommandDetails<PARAMS> {

    repoFilter?: RepoFilter;

    reviewRouter: ReviewRouter<PARAMS>;

}

function defaultDetails(name: string): ReviewerCommandDetails<BaseEditorParameters> {
    return {
        description: name,
        reviewRouter: issueRaisingReviewRouter,
    };
}

/**
 * Create a handle function that reviews one or many repos, following BaseEditorParameters
 * @param reviewerFactory function returning a reviewer instance for the appropriate parameters
 * @param {ParametersConstructor<PARAMS>} factory
 * @param {string} name
 * @param {string} details object allowing customization beyond reasonable defaults
 * @return {HandleCommand}
 */
export function reviewerHandler<PARAMS extends BaseEditorParameters>(reviewerFactory: (params: PARAMS) => ProjectReviewer<PARAMS>,
                                                                     factory: ParametersConstructor<PARAMS>,
                                                                     name: string,
                                                                     details: Partial<ReviewerCommandDetails<PARAMS>> = {}): HandleCommand {
    const detailsToUse: ReviewerCommandDetails<BaseEditorParameters> = {
        ...defaultDetails(name),
        ...details,
    };
    return commandHandlerFrom(handleReviewOneOrMany(reviewerFactory, name, detailsToUse),
        factory,
        name,
        detailsToUse.description, detailsToUse.intent, detailsToUse.tags);
}

/**
 * If owner and repo are required, review just one repo. Otherwise review all repos
 * in the present team
 */
function handleReviewOneOrMany<PARAMS extends BaseEditorParameters>(reviewerFactory: (params: PARAMS) => ProjectReviewer<PARAMS>,
                                                                    name: string,
                                                                    details: ReviewerCommandDetails<PARAMS>): OnCommand<PARAMS> {
    return (ctx: HandlerContext, parameters: PARAMS) => {
        const credentials = {token: parameters.githubToken};
        const repoFinder: RepoFinder = (!!parameters.owner && !!parameters.repo) ?
            // TODO will implement interface
            () => Promise.resolve([new GitHubRepoRef(parameters.owner, parameters.repo)]) :
            details.repoFinder;
        return reviewAll(ctx, credentials, reviewerFactory(parameters), parameters,
            repoFinder, details.repoFilter,
            !!details.repoLoader ? details.repoLoader(parameters) : undefined)
            .then(projectReviews => {
                return Promise.all(projectReviews
                    .filter(pr => pr.comments.length > 0)
                    .map(pr => {
                        return ctx.messageClient.respond(
                            `Publishing review for ${pr.repoId.owner}/${pr.repoId.repo} with ${pr.comments.length} problems`)
                            .then(() => details.reviewRouter(pr, parameters, name));
                    }))
                    .then(persisted =>
                        ctx.messageClient.respond(`${persisted.length} reviews completed and published`));
            });
    };
}

/**
 * Raise issue in this repo
 * @param pr ProjectReview
 * @param {BaseEditorParameters} params
 * @param name name of issue finder
 * @return {any}
 */
const issueRaisingReviewRouter: ReviewRouter<BaseEditorParameters> =
    (pr: ProjectReview, params: BaseEditorParameters, name: string) => {
        if (isGitHubRepoRef(pr.repoId)) {
            const issue = toIssue(pr, name);
            return raiseIssue(params.githubToken, pr.repoId, issue)
                .then(ap => successOn(pr.repoId));
        } else {
            return Promise.resolve(failureOn(pr.repoId, new Error(`Not a GitHub Repo: ${JSON.stringify(pr.repoId)}`)));
        }
    };

function toIssue(pr: ProjectReview, name: string): Issue {
    return {
        title: `${pr.comments.length} problems found by ${name}`,
        body: "Problems:\n\n" + pr.comments.map(c =>
            toMarkdown(pr.repoId as GitHubRepoRef, c)).join("\n"),
    };
}

function toMarkdown(grr: GitHubRepoRef, rc: ReviewComment) {
    return `-\t**${rc.severity}** - [${rc.comment}](${deepLink(grr, rc.sourceLocation)})`;
}
