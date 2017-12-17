import { HandleCommand } from "@atomist/automation-client";
import { commandHandlerFrom, OnCommand } from "@atomist/automation-client/onCommand";
import { MappedOrFallbackParameters } from "./MappedOrFallbackParameters";
import { nodeTaggerCommand } from "./nodeTagger";
import { springBootTaggerCommand } from "./springTagger";

/*

  // TODO why compiler error
const handler: OnCommand<MappedOrFallbackParameters> =
    (ctx, parameters) => {
        // Fortunately all these commands have the same parameters
        return springBootTaggerCommand().handle(ctx, parameters)
            .then(() => nodeTaggerCommand().handle(ctx, parameters))
            .then(() => ctx.messageClient.respond("Tagging complete"));
    };

export const tagAllCommand: HandleCommand = commandHandlerFrom(
    handler,
    MappedOrFallbackParameters,
    "TagAll",
    "Tag all repos",
    ["tag all"],
    // No tags as we only want to run from the bot
    [],
);

*/
