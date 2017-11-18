import { GitHubRepoRef } from "@atomist/automation-client/operations/common/GitHubRepoRef";
import { fileContent } from "@atomist/automation-client/util/gitHub";
import { GeneratorCall, JavaTag, MavenTag, NpmTag, SeedMetadata, Seeds, SpringBootTag } from "./Seeds";
import { defaultSeeds, genericCall } from "./defaultSeeds";

/**
 * Choose an editor to chooseGenerator to based on the given seed,
 * using a local database and GitHub API.
 * @param token GitHub token
 * @param {GitHubRepoRef} seedId id of the seed
 * @return {GeneratorCall}
 */
export function chooseGenerator(token: string, seedId: GitHubRepoRef,
                                seeds: Seeds = defaultSeeds): Promise<GeneratorCall> {
    return Promise.resolve(determineFromSeedMetadata(seedId, seeds))
        .then(call => !!call ? call : determineFromGithubApi(token, seedId));

}

function determineFromSeedMetadata(id: GitHubRepoRef, seeds: Seeds): Promise<GeneratorCall> | GeneratorCall {
    const smd = seeds.seeds.find(s => s.id.owner === id.owner && s.id.repo === id.repo);
    if (!smd) {
        return undefined;
    }
    return !!smd.generatorCall ?
        smd.generatorCall :
        callFromTags(id, smd);
}

function callFromTags(id: GitHubRepoRef, smd: SeedMetadata): GeneratorCall {
    if (smd.tags.includes(JavaTag) && smd.tags.includes(MavenTag)) {
        return javaInfoToCall(id, {maven: true, springBoot: smd.tags.includes(SpringBootTag)});
    }
    if (smd.tags.includes(NpmTag)) {
        return nodeInfoToCall(id, {npm: true});
    }
    return undefined;
}

interface JavaInfo {

    maven: boolean;
    springBoot: boolean;
    // TODO add gradle
}

interface NodeInfo {

    npm: boolean;
}

function determineFromGithubApi(token: string, seedId: GitHubRepoRef): Promise<GeneratorCall> {
    const javaInfo: Promise<JavaInfo> =
        fileContent(token, seedId.owner, seedId.repo, "pom.xml")
            .then(content => {
                if (!!content) {
                    return {
                        maven: true,
                        springBoot: content.includes("org.springframework.boot"),
                    };
                } else {
                    return undefined;
                }
            });
    const nodeInfo: Promise<NodeInfo> = fileContent(token, seedId.owner, seedId.repo, "package.json")
        .then(content => {
            if (!!content) {
                return {
                    npm: true,
                };
            } else {
                return undefined;
            }
        });

    return javaInfo.then(ji =>
        !!ji ? javaInfoToCall(seedId, ji) :
            nodeInfo.then(ni =>
                !!ni ? nodeInfoToCall(seedId, ni) : genericCall(seedId)));
}

function javaInfoToCall(seedId: GitHubRepoRef, ji: JavaInfo): GeneratorCall {
    return {
        // This will want to split ultimately
        generatorName: ji.springBoot ? "spring-repo-creator" : "spring-repo-creator",
        seedId,
        setupArgs: [],
        understood: true,
    };
}

function nodeInfoToCall(seedId: GitHubRepoRef, ni: NodeInfo): GeneratorCall {
    return {
        generatorName: "node-generator",
        seedId,
        setupArgs: [],
        understood: true,
    };
}
