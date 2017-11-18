
import { GitHubRepoRef } from "@atomist/automation-client/operations/common/GitHubRepoRef";

export const JavaTag = "java";

export const SpringTag = "spring";
export const SpringBootTag = "spring-boot";
export const MavenTag = "maven";

export const TypeScriptTag = "typescript";
export const JavaScriptTag = "javascript";

export const NodeTag = "node";
export const ExpressTag = "express";
export const ReactTag = "react";

export interface SeedMetadata {

    id: GitHubRepoRef;

    tags: string[];
}

export interface Seeds {

    seeds: SeedMetadata[];

}
