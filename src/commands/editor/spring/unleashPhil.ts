import { HandleCommand } from "@atomist/automation-client";
import { commandHandlerFrom, OnCommand } from "@atomist/automation-client/onCommand";
import { BaseEditorParameters } from "@atomist/automation-client/operations/edit/BaseEditorParameters";
import { findMutableInjectionsCommand } from "./findMutableInjections";
import { findNonSpecificMvcAnnotationsCommand } from "./findNonSpecificMvcAnnotations";
import {
    removeAutowiredOnSoleConstructorCommand,
    removeUnnecessaryComponentScanCommand,
} from "./removeUnnecessaryAnnotations";
import { SpringBootTags } from "./springConstants";
import { verifyPomCommand } from "./verifyPom";

const handler: OnCommand<BaseEditorParameters> =
    (ctx, parameters) => {
        // Fortunately all these commands have the same parameters
        return ctx.messageClient.respond("PHOTO OF PHIL")
            .then(() => ctx.messageClient.respond("Phil is inspecting..."))
            .then(() => findNonSpecificMvcAnnotationsCommand.handle(ctx, parameters))
            .then(() => findMutableInjectionsCommand.handle(ctx, parameters))
            .then(() => verifyPomCommand.handle(ctx, parameters))
            .then(() => ctx.messageClient.respond("Phil is suggesting changes. Ignore his PRs at your peril!"))
            .then(() => removeUnnecessaryComponentScanCommand.handle(ctx, parameters))
            .then(() => removeAutowiredOnSoleConstructorCommand.handle(ctx, parameters))
            .then(() => ctx.messageClient.respond("Phil is finished with your organization"));
    };

export const unleashPhilCommand: HandleCommand = commandHandlerFrom(
    handler,
    BaseEditorParameters,
    "UnleashPhil",
    "Unleash Phil Webb",
    "unleash phil",
    SpringBootTags,
);
