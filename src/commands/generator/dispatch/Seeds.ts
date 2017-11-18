
import { GitHubRepoRef } from "@atomist/automation-client/operations/common/GitHubRepoRef";
import { Arg } from "@atomist/automation-client/internal/invoker/Payload";

export const JavaTag = "java";

export const SpringTag = "spring";
export const SpringBootTag = "spring-boot";
export const MavenTag = "maven";

export const TypeScriptTag = "typescript";
export const JavaScriptTag = "javascript";

export const NpmTag = "npm";
export const ExpressTag = "express";
export const ReactTag = "react";

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

export interface SeedMetadata {

    id: GitHubRepoRef;

    tags: string[];

    generatorCall?: GeneratorCall;
}

export interface Seeds {

    seeds: SeedMetadata[];

}
