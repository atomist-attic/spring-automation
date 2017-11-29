
// Find non specific MVC annotations

import { JavaFileParser } from "@atomist/antlr/tree/ast/antlr/java/JavaFileParser";
import { SourceLocation } from "@atomist/automation-client/operations/common/SourceLocation";
import { Project } from "@atomist/automation-client/project/Project";
import { findMatches } from "@atomist/automation-client/tree/ast/astUtils";
import { JavaSourceFiles } from "../../generator/java/javaProjectUtils";

export interface NonSpecificMvcAnnotation {

    raw: string;

    sourceLocation: SourceLocation;
}

const RequestMappingAnnotation = `//annotation[//annotationName[@value='RequestMapping']]`;

/**
 * Find all non specific, old style @RequestMapping annotations
 * @param {Project} p project to search
 * @param {string} globPattern glob pattern, defaults to standard Maven
 * location of source tree.
 */
export function findNonSpecificMvcAnnotations(p: Project,
                                              globPattern: string = JavaSourceFiles): Promise<NonSpecificMvcAnnotation[]> {
    return findMatches(p, JavaFileParser, globPattern, RequestMappingAnnotation)
        .then(fileHits =>
            fileHits.map(m => ({
                raw: m.$value,
                sourceLocation: m.sourceLocation,
            })));
}
