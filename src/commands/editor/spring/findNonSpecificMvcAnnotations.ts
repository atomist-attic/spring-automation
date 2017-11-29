
import { JavaFileParser } from "@atomist/antlr/tree/ast/antlr/java/JavaFileParser";
import { SourceLocation } from "@atomist/automation-client/operations/common/SourceLocation";
import { ReviewComment, Severity } from "@atomist/automation-client/operations/review/ReviewResult";
import { Project } from "@atomist/automation-client/project/Project";
import { findMatches } from "@atomist/automation-client/tree/ast/astUtils";
import { JavaSourceFiles } from "../../generator/java/javaProjectUtils";

export class NonSpecificMvcAnnotation implements ReviewComment {

    public severity: Severity = "info";

    constructor(public raw: string, public sourceLocation: SourceLocation) {
    }

    get comment() {
        return `Old style Spring MVC @RequestAnnotation ` +
            `in file ${this.sourceLocation.path}:${this.sourceLocation.lineFrom1}:${this.sourceLocation.columnFrom1}: Use specific mapping`;
    }
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
            fileHits.map(m => new NonSpecificMvcAnnotation(
                m.$value,
                m.sourceLocation)));
}
