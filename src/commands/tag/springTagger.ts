import { HandleCommand } from "@atomist/automation-client";
import { SpringBootStarter, SpringBootTaggerTags } from "../editor/spring/springConstants";

import { DefaultTags, TagRouter } from "@atomist/automation-client/operations/tagger/Tagger";
import { taggerHandler } from "@atomist/automation-client/operations/tagger/taggerHandler";
import { toPromise } from "@atomist/automation-client/project/util/projectUtils";
import { UnleashPhilParameters } from "../editor/spring/unleashPhil";
import { AllJavaFiles } from "../generator/java/javaProjectUtils";
import { GitHubTagRouter } from "./gitHubTagRouter";

export const springBootTagger = p => {
    return p.findFile("pom.xml")
        .then(f => f.getContent())
        .then(content => {
            const tags: string[] = [];
            if (content.includes(SpringBootStarter)) {
                tags.push("spring-boot");
                tags.push("spring");
            } else if (content.includes("org.springframework")) {
                tags.push("spring");
            }
            // TODO need to simplify this
            return toPromise(p.streamFiles(AllJavaFiles))
                .then(javaFiles => {
                    if (javaFiles.length > 0) {
                        tags.push("java");
                    }
                    return new DefaultTags(p.id, tags);
                });
        })
        .catch(err => {
            console.log("Tag error: " + err);
            return new DefaultTags(p.id, []);
        });
};

export function springBootTaggerCommand(tagRouter: TagRouter = GitHubTagRouter): HandleCommand {
    return taggerHandler(springBootTagger,
        UnleashPhilParameters,
        "SpringBootTagger",
        {
            description: "Tag Spring Boot projects",
            tags: SpringBootTaggerTags.concat("tagger"),
            intent: "tag spring",
            tagRouter,
        },
    );
}
