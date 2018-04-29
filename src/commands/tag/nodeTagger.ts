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

import { HandleCommand, logger } from "@atomist/automation-client";
import { SpringBootTaggerTags } from "../editor/spring/springConstants";

import { DefaultTags, TagRouter } from "@atomist/automation-client/operations/tagger/Tagger";
import { taggerHandler } from "@atomist/automation-client/operations/tagger/taggerHandler";
import { toPromise } from "@atomist/automation-client/project/util/projectUtils";
import { UnleashPhilParameters } from "../editor/spring/unleashPhil";
import { GitHubTagRouter } from "./gitHubTagRouter";

// TODO this shouldn't really be here
export const nodeTagger = p => {
    return p.findFile("package.json")
        .then(f => f.getContent())
        .then(content => {
            const tags: string[] = ["node", "npm"];
            if (content.includes("what")) {
                // TODO add something
            } else if (content.includes("org.springframework")) {
                // TODO similar
                // tags.push("spring");
            }
            // TODO need to simplify this
            return toPromise(p.streamFiles("**/*.ts"))
                .then(tsFiles => {
                    if (tsFiles.length > 0) {
                        tags.push("typescript");
                    }
                    return new DefaultTags(p.id, tags);
                });
        })
        .catch(err => {
            logger.warn("Tag error: " + err);
            return new DefaultTags(p.id, []);
        });
};

export function nodeTaggerCommand(tagRouter: TagRouter = GitHubTagRouter): HandleCommand {
    return taggerHandler(nodeTagger,
        UnleashPhilParameters,
        "NodeTagger",
        {
            description: "Tag node projects",
            tags: SpringBootTaggerTags.concat("tagger"),
            intent: "tag node",
            tagRouter,
        },
    );
}
