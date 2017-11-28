/**
 * Return injected fields
 * @param {Project} p
 * @param {string} globPattern
 * @return {Promise<FileWithInjectedFields[]>}
 */

import { JavaFileParser } from "@atomist/antlr/tree/ast/antlr/java/JavaFileParser";
import { findFileMatches } from "@atomist/automation-client/tree/ast/astUtils";
import { JavaSourceFiles } from "../../generator/java/javaProjectUtils";

import { File } from "@atomist/automation-client/project/File";
import { Project } from "@atomist/automation-client/project/Project";

export interface InjectedField {

    name: string;

    offset: number;
}

export interface FileWithInjectedFields {

    file: File;
    fields: InjectedField[];
}

// TODO will eventually use OR predicates - for @Inject
const InjectedFields = `//classBodyDeclaration[//annotation[@value='@Autowired']]
                            //fieldDeclaration//variableDeclaratorId |
                         //classBodyDeclaration[//annotation[@value='@Inject']]
                            //fieldDeclaration//variableDeclaratorId`;

/**
 * Find all fields annotated with @Autowired or @Inject in the codebase.
 * This is an undesirable usage pattern in application code, although
 * acceptable in tests.
 * @param {Project} p project to search
 * @param {string} globPattern glob pattern, defaults ot standard Maven
 * location of source tree.
 * @return {Promise<FileWithInjectedFields[]>}
 */
export function findInjectedFields(p: Project,
                                   globPattern: string = JavaSourceFiles): Promise<FileWithInjectedFields[]> {
    return findFileMatches(p, JavaFileParser, globPattern, InjectedFields)
        .then(fileHits => fileHits.map(fh => ({
            file: fh.file,
            fields: fh.matches.map(m => ({
                name: m.$value,
                offset: m.$offset,
            })),
        })));
}
