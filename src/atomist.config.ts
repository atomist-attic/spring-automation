/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
