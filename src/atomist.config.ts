import { Configuration } from "@atomist/automation-client";

import { findMutableInjectionsCommand } from "./commands/editor/spring/findMutableInjections";
import { findNonSpecificMvcAnnotationsCommand } from "./commands/editor/spring/findNonSpecificMvcAnnotations";
import { removeAutowiredOnSoleConstructorCommand } from "./commands/editor/spring/removeUnnecessaryAutowiredAnnotations";
import {
    findUnnecessaryComponentScanReviewerCommand,
    removeUnnecessaryComponentScanCommand,
} from "./commands/editor/spring/removeUnnecessaryComponentScanAnnotations";
import { springBootVersionUpgrade } from "./commands/editor/spring/SpringBootVersionUpgrade";
import { unleashPhilCommand } from "./commands/editor/spring/unleashPhil";
import { verifyPomCommand } from "./commands/editor/spring/verifyPom";
import { kotlinSpring5Generator } from "./commands/generator/spring/kotlinSpring5Generator";
import { springBootGenerator } from "./commands/generator/spring/springBootGenerator";
import { MessagingReviewRouter } from "./commands/messagingReviewRouter";
import { springBootVersionReviewerCommand } from "./commands/reviewer/spring/SpringBootVersionReviewer";
import { tagAllCommand } from "./commands/tag/allTagger";
import { nodeTaggerCommand } from "./commands/tag/nodeTagger";
import { springBootTaggerCommand } from "./commands/tag/springTagger";
import { configureLogzio } from "./util/logzio";

export const configuration: Configuration = {
    commands: [
        () => removeUnnecessaryComponentScanCommand,
        () => removeAutowiredOnSoleConstructorCommand,
        springBootGenerator,
        kotlinSpring5Generator,
        springBootVersionUpgrade,
        findNonSpecificMvcAnnotationsCommand,
        findUnnecessaryComponentScanReviewerCommand,
        findMutableInjectionsCommand,
        verifyPomCommand,
        springBootTaggerCommand,
        nodeTaggerCommand,
        () => tagAllCommand,
        () => unleashPhilCommand,
        () => springBootVersionReviewerCommand(MessagingReviewRouter),
    ],
    events: [],
    listeners: [],
    postProcessors: [configureLogzio],
};
