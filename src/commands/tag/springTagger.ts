import { taggerHandler, TagRouter } from "./taggerToCommand";
import { HandleCommand } from "@atomist/automation-client";
import { BaseEditorOrReviewerParameters } from "@atomist/automation-client/operations/common/params/BaseEditorOrReviewerParameters";
import { SpringBootTags } from "../editor/spring/springConstants";

const springBootTagger = p => {
    return Promise.resolve({
        tags: ["spring", "spring-boot"],
    });
};

export function springBootTaggerCommand(tagRouter?: TagRouter): HandleCommand {
    return taggerHandler(springBootTagger,
        BaseEditorOrReviewerParameters,
        "SpringBootTagger",
        {
            description: "Tag Spring Boot projects",
            tags: SpringBootTags,
            intent: "tag spring",
            //tagRouter: tagRouter,
        },
    );
}