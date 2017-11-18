import { GitHubRepoRef } from "@atomist/automation-client/operations/common/GitHubRepoRef";
import { Arg } from "@atomist/automation-client/internal/invoker/Payload";
import { RepoRef } from "@atomist/automation-client/operations/common/RepoId";
import { fileContent } from "@atomist/automation-client/util/gitHub";

/**
 * Information needed to route to appropriate generator form.
 */
export interface GeneratorCall {

    generatorName: string;

    seedId: GitHubRepoRef;

    /**
     * Additional arguments needed to populate the generate form or
     * initialize the generator, besides
     * whatever parameters that the generator will itself ask for. For example,
     * default parameter values.
     */
    setupArgs: Arg[];

    /**
     * Did we understand the repo or are we falling back to copying it?
     */
    understood: boolean;

}

function genericCall(seedId: GitHubRepoRef): GeneratorCall {
    return {
        generatorName: "copy-generator",
        seedId,
        setupArgs: [],
        understood: false,
    };
}

/**
 * Choose an editor to chooseGenerator to based on the given seed,
 * using a local database and GitHub API.
 * @param token GitHub token
 * @param {GitHubRepoRef} seedId id of the seed
 * @return {GeneratorCall}
 */
export function chooseGenerator(token: string, seedId: GitHubRepoRef): Promise<GeneratorCall> {
    return determineFromLocalDatabase(seedId)
        .then(call => !!call ? call : determineFromGithubApi(token, seedId));

}

function determineFromLocalDatabase(seedId: RepoRef): Promise<GeneratorCall> {
    // TODO we can look up custom generators etc here
    return Promise.resolve(undefined);
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
                    }
                } else {
                    return undefined;
                }
            });
    const nodeInfo: Promise<NodeInfo> = fileContent(token, seedId.owner, seedId.repo, "package.json")
        .then(content => {
            if (!!content) {
                return {
                    npm: true,
                }
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
        generatorName: ji.springBoot ? "spring-repo-creator" : "java-generator",
        seedId,
        setupArgs: [],
        understood: true,
}
}

function nodeInfoToCall(seedId: GitHubRepoRef, ni: NodeInfo): GeneratorCall {
    return {
        generatorName: "node-generator",
        seedId,
        setupArgs: [],
        understood: true,
    };
}
