import { HandleCommand, HandlerContext, Parameter } from "@atomist/automation-client";
import { commandHandlerFrom, OnCommand } from "@atomist/automation-client/onCommand";
import * as slack from "@atomist/slack-messages";
import { MessagingReviewRouter } from "../../messagingReviewRouter";
import {
    CurrentSpringBootVersion,
    springBootVersionReviewerCommand,
    SpringBootVersionReviewerParameters,
} from "../../reviewer/spring/SpringBootVersionReviewer";
import { findMutableInjectionsCommand } from "./findMutableInjections";
import { findNonSpecificMvcAnnotationsCommand } from "./findNonSpecificMvcAnnotations";
import {
    removeAutowiredOnSoleConstructorCommand,
    removeUnnecessaryComponentScanCommand,
} from "./removeUnnecessaryAnnotations";
import { SpringBootTags } from "./springConstants";
import { verifyPomCommand } from "./verifyPom";
import { Parameters } from "@atomist/automation-client/decorators";
import { MappedRepoParameters } from "@atomist/automation-client/operations/common/params/MappedRepoParameters";
import { AlwaysAskRepoParameters } from "@atomist/automation-client/operations/common/params/AlwaysAskRepoParameters";
import { GitHubParams } from "@atomist/automation-client/operations/common/params/GitHubParams";

const oldPhil = "http://www.victorianceramics.com/images/artists/philip-webb.jpg";
const springPhil = "https://pbs.twimg.com/profile_images/606164636811984896/QEAnB8Xu.jpg";

@Parameters()
export class UnleashPhilParameters extends GitHubParams {

    public owner: string;

    @Parameter({required: false})
    public repo: string = ".*";

    public sha;

    @Parameter({
        displayName: "Desired Spring Boot version",
        description: "The desired Spring Boot version across these repos",
        pattern: /^.+$/,
        validInput: "Semantic version",
        required: false,
    })
    public desiredBootVersion: string = CurrentSpringBootVersion;

}

const handler: OnCommand<SpringBootVersionReviewerParameters> =
    (ctx, parameters) => {
        // Fortunately all these commands have the same parameters
        return showPhil(ctx)
            .then(() => ctx.messageClient.respond("Phil is inspecting..."))
            .then(() => findNonSpecificMvcAnnotationsCommand().handle(ctx, parameters))
            .then(() => findMutableInjectionsCommand().handle(ctx, parameters))
            .then(() => verifyPomCommand().handle(ctx, parameters))
            .then(() => springBootVersionReviewerCommand(MessagingReviewRouter).handle(ctx, parameters))
            .then(() => ctx.messageClient.respond("Phil is suggesting changes. Ignore his PRs at your peril!"))
            .then(() => removeUnnecessaryComponentScanCommand.handle(ctx, parameters))
            .then(() => removeAutowiredOnSoleConstructorCommand.handle(ctx, parameters))
            .then(() => ctx.messageClient.respond("Phil is finished with your organization"));
    };

function showPhil(ctx: HandlerContext) {
    const msg: slack.SlackMessage = {
        text: "Phil", attachments: [{
            image_url: oldPhil,
            fallback: "Phil",
        }], unfurl_media: true
    };
    return ctx.messageClient.respond(msg);
}

export const unleashPhilCommand: HandleCommand = commandHandlerFrom(
    handler,
    UnleashPhilParameters,
    "UnleashPhil",
    "Unleash Phil Webb",
    "unleash phil",
    SpringBootTags,
);

export const askPhilCommand: HandleCommand = commandHandlerFrom(
    handler,
    SpringBootVersionReviewerParameters,
    "askPhil",
    "Ask Phil Webb",
    "ask phil",
    SpringBootTags,
);
