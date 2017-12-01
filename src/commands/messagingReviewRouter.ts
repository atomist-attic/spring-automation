
import { successOn } from "@atomist/automation-client/action/ActionResult";
import { GitHubRepoRef } from "@atomist/automation-client/operations/common/GitHubRepoRef";
import { ReviewRouter } from "@atomist/automation-client/operations/review/reviewerToCommand";
import { ReviewComment } from "@atomist/automation-client/operations/review/ReviewResult";
import { deepLink } from "@atomist/automation-client/util/gitHub";

/**
 * ReviewRouter that messages to client
 * @param {ProjectReview} pr
 * @param params
 * @param {string} title
 * @param {HandlerContext} ctx
 * @return {Promise<ActionResult<RepoRef>>}
 * @constructor
 */
export const MessagingReviewRouter: ReviewRouter<any> =
    (pr, params, title, ctx) => {
        const msg = `*${title}*\n` + pr.comments.map(c => toMarkdown(pr.repoId as GitHubRepoRef, c)).join("\n");
        return ctx.messageClient.respond(msg)
            .then(() => successOn(pr.repoId));
    };

function toMarkdown(grr: GitHubRepoRef, rc: ReviewComment) {
    return `-\t**${rc.severity}** - [${rc.comment}](${deepLink(grr, rc.sourceLocation)})`;
}
