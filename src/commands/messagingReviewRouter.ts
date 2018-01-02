import { successOn } from "@atomist/automation-client/action/ActionResult";
import { GitHubRepoRef } from "@atomist/automation-client/operations/common/GitHubRepoRef";
import { ReviewRouter } from "@atomist/automation-client/operations/review/reviewerToCommand";
import { ReviewComment } from "@atomist/automation-client/operations/review/ReviewResult";
import { buttonForCommand } from "@atomist/automation-client/spi/message/MessageClient";
import { deepLink } from "@atomist/automation-client/util/gitHub";
import * as slack from "@atomist/slack-messages";
import { Attachment, SlackMessage } from "@atomist/slack-messages";

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
        const mesg: SlackMessage = {
            text: `*${title} on ${pr.repoId.owner}/${pr.repoId.repo}*`,
            attachments: pr.comments.map(c => reviewCommentToAttachment(pr.repoId as GitHubRepoRef, c)),
        };
        //tslint is going to hate this
        return ctx.messageClient.respond(mesg)
            .then(() => successOn(pr.repoId));
    };

function reviewCommentToAttachment(grr: GitHubRepoRef, rc: ReviewComment): Attachment {
    return {
        color: "#ff0000",
        author_name: rc.category,
        author_icon: "https://image.shutterstock.com/z/stock-vector-an-image-of-a-red-grunge-x-572409526.jpg",
        text: `${slack.url(deepLink(grr, rc.sourceLocation), "jump to")} ${rc.detail}`,
        mrkdwn_in: ["text"],
        fallback: "error",
        actions: !!rc.fix ? [
            buttonForCommand({text: "Fix"}, rc.fix.command, rc.fix.params),
        ] : [],
    };
}
