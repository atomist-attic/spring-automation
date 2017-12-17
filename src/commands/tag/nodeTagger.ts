import { HandleCommand } from "@atomist/automation-client";
import { SpringBootTaggerTags } from "../editor/spring/springConstants";

import { DefaultTags, TagRouter } from "@atomist/automation-client/operations/tagger/Tagger";
import { taggerHandler } from "@atomist/automation-client/operations/tagger/taggerHandler";
import { toPromise } from "@atomist/automation-client/project/util/projectUtils";
import { GitHubTagRouter } from "./gitHubTagRouter";
import { MappedOrFallbackParameters } from "./MappedOrFallbackParameters";

export const nodeTagger = p => {
    return p.findFile("package.json")
        .then(f => f.getContent())
        .then(content => {
            const tags: string[] = [ "node", "npm" ];
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
            console.log("Tag error: " + err);
            return new DefaultTags(p.id, []);
        });
};

export function nodeTaggerCommand(tagRouter: TagRouter = GitHubTagRouter): HandleCommand {
    return taggerHandler(nodeTagger,
        MappedOrFallbackParameters,
        "NodeTagger",
        {
            description: "Tag node projects",
            tags: SpringBootTaggerTags.concat("tagger"),
            intent: "tag node",
            tagRouter,
        },
    );
}
