import { commandHandlerFrom, OnCommand } from "@atomist/automation-client/onCommand";
import { BaseEditorParameters } from "@atomist/automation-client/operations/edit/BaseEditorParameters";
import { HandleCommand } from "@atomist/automation-client";
import { SpringBootTags } from "./springConstants";
import { findNonSpecificMvcAnnotationsCommand } from "./findNonSpecificMvcAnnotations";
import { findMutableInjectionsCommand } from "./findMutableInjections";
import { verifyPomCommand } from "./verifyPom";

const handler: OnCommand<BaseEditorParameters> =
    (ctx, parameters) => {
        return ctx.messageClient.respond("PHOTO OF PHIL")
            .then(() => findNonSpecificMvcAnnotationsCommand.handle(ctx, parameters))
            .then(() => findMutableInjectionsCommand.handle(ctx, parameters))
            .then(() => verifyPomCommand.handle(ctx, parameters));
    };

export const unleashPhilCommand: HandleCommand = commandHandlerFrom(
    handler,
    BaseEditorParameters,
    "UnleashPhil",
    "Unleash Phil Webb",
    "unleash phil",
    SpringBootTags,
);

