import { ExpressTag, JavaTag, MavenTag, NodeTag, Seeds, SpringBootTag, SpringTag, TypeScriptTag } from "./Seeds";
import { GitHubRepoRef } from "@atomist/automation-client/operations/common/GitHubRepoRef";

export const defaultSeeds: Seeds = {

    seeds: [
        {
            id: new GitHubRepoRef("atomist-seeds", "spring-rest-seed"),
            tags: [ SpringTag, SpringBootTag, JavaTag, MavenTag ],
        },
        {
            id: new GitHubRepoRef("blove", "typescript-express-starter"),
            tags: [ TypeScriptTag, ExpressTag, NodeTag ],
        },
        ],

};
