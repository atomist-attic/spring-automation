import { ProjectAsync } from "@atomist/automation-client/project/Project";
import { SpringBootProjectStructure } from "../spring/SpringBootProjectStructure";

export const AllKotlinFiles = "src/**/kotlin/**/*.kt";

export const KotlinSourceFiles = "src/main/kotlin/**/*.kt";

/**
 * Infer the Spring Boot structure of a Kotlin project, looking for a Kotlin
 * class annotated with @SpringBootApplication
 * @param {ProjectAsync} p
 * @return {Promise<SpringBootProjectStructure>}
 */
export function inferFromKotlinSource(p: ProjectAsync): Promise<SpringBootProjectStructure> {
    return SpringBootProjectStructure.inferFromKotlinSource(p);
}
