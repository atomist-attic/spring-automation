import { HandleCommand, HandlerContext, Parameter } from "@atomist/automation-client";
import { Parameters } from "@atomist/automation-client/decorators";
import { commandHandlerFrom, OnCommand } from "@atomist/automation-client/onCommand";
import { BaseEditorOrReviewerParameters } from "@atomist/automation-client/operations/common/params/BaseEditorOrReviewerParameters";
import { SmartParameters } from "@atomist/automation-client/SmartParameters";
import * as slack from "@atomist/slack-messages";
import { MessagingReviewRouter } from "../../messagingReviewRouter";
import {
    CurrentSpringBootVersion,
    springBootVersionReviewerCommand,
    SpringBootVersionReviewerParameters,
} from "../../reviewer/spring/SpringBootVersionReviewer";
import { findMutableInjectionsCommand } from "./findMutableInjections";
import { findNonSpecificMvcAnnotationsCommand } from "./findNonSpecificMvcAnnotations";
import { removeAutowiredOnSoleConstructorCommand } from "./removeUnnecessaryAutowiredAnnotations";
import { verifyPomCommand } from "./verifyPom";

import * as assert from "power-assert";
import { FallbackReposParameters } from "../FallbackReposParameters";
import { removeUnnecessaryComponentScanCommand } from "./removeUnnecessaryComponentScanAnnotations";

const springPhil = "https://pbs.twimg.com/profile_images/606164636811984896/QEAnB8Xu.jpg";

/**
 * Parameters with fallback
 */
@Parameters()
export class UnleashPhilParameters extends BaseEditorOrReviewerParameters implements SmartParameters {

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

    public bindAndValidate() {
        const targets = this.targets as FallbackReposParameters;
        if (!targets.repo) {
            assert(!!targets.repos, "Must set repos or repo");
            targets.repo = targets.repos;
        }
    }

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
            .then(() => ctx.messageClient.respond("Phil is finished with you"));
    };

function showPhil(ctx: HandlerContext) {
    const msg: slack.SlackMessage = {
        text: "Phil", attachments: [{
            image_url: springPhil,
            fallback: "Phil",
        }], unfurl_media: true,
    };
    return ctx.messageClient.respond(msg);
}

export const unleashPhilCommand: HandleCommand = commandHandlerFrom(
    handler,
    UnleashPhilParameters,
    "UnleashPhil",
    "Unleash Phil Webb",
    ["unleash phil", "ask phil"],
    // No tags as we only want to run from the bot
    [],
);
