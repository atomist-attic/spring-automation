import {
    ExpressTag, GeneratorCall, JavaScriptTag, JavaTag, MavenTag, NpmTag, ReactTag, Seeds, SpringBootTag, SpringTag,
    TypeScriptTag,
} from "./Seeds";
import { GitHubRepoRef } from "@atomist/automation-client/operations/common/GitHubRepoRef";

export const defaultTags: String[] =
    [JavaTag, SpringTag, SpringBootTag, MavenTag, NpmTag, ExpressTag,
        TypeScriptTag, JavaScriptTag, ReactTag].sort();

export const defaultSeeds: Seeds = {

    seeds: [
        {
            id: new GitHubRepoRef("atomist-seeds", "spring-rest-seed"),
            tags: [SpringTag, SpringBootTag, JavaTag, MavenTag],
            get generatorCall() {
                return springCall(this.id);
            },
        },
        {
            id: new GitHubRepoRef("blove", "typescript-express-starter"),
            tags: [TypeScriptTag, ExpressTag, NpmTag],
            get generatorCall() {
                return nodeCall(this.id);
            },
        },
        {
            id: new GitHubRepoRef("gilamran", "fullstack-typescript"),
            tags: [TypeScriptTag, ExpressTag, NpmTag, ReactTag],
            get generatorCall() {
                return nodeCall(this.id);
            },
        },
    ],

};

/**
 * Fallback call if we can't figure out anything about this repo
 * @param {GitHubRepoRef} seedId
 * @return {GeneratorCall}
 */
export function genericCall(seedId: GitHubRepoRef): GeneratorCall {
    return {
        generatorName: "copy-generator",
        seedId,
        setupArgs: [],
        understood: false,
    };
}

function springCall(seedId: GitHubRepoRef): GeneratorCall {
    return {
        // This will want to split ultimately
        generatorName: "spring-repo-creator",
        seedId,
        setupArgs: [],
        understood: true,
    };
}

function nodeCall(seedId: GitHubRepoRef): GeneratorCall {
    return {
        generatorName: "node-generator",
        seedId,
        setupArgs: [],
        understood: true,
    };
}
