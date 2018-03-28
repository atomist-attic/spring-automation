/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { HandleCommand } from "@atomist/automation-client";
import { commandHandlerFrom, OnCommand } from "@atomist/automation-client/onCommand";
import { UnleashPhilParameters } from "../editor/spring/unleashPhil";
import { nodeTaggerCommand } from "./nodeTagger";
import { springBootTaggerCommand } from "./springTagger";

const handler: OnCommand<UnleashPhilParameters> =
    (ctx, parameters) => {
        // Fortunately all these commands have the same parameters
        // TODO why do we need to break this up for compile checking?
        const springTag: Promise<any> = springBootTaggerCommand().handle(ctx, parameters);
        const nodeTag: Promise<any> = nodeTaggerCommand().handle(ctx, parameters);
        return springTag
            .then(() => nodeTag)
            .then(() => ctx.messageClient.respond("Tagging complete"));
    };

export const tagAllCommand: HandleCommand = commandHandlerFrom(
    handler,
    UnleashPhilParameters,
    "TagAll",
    "Tag all repos",
    "tag all",
    // No tags as we only want to run from the bot
    [],
);
