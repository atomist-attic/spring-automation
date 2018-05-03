/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
