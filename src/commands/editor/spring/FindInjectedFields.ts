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

export interface FileWithInjectedFields {

    file: File;
    fieldNames: string[];
}

// TODO will eventually use OR predicates - for Inject
const InjectedFields = `//classBodyDeclaration[//annotation[@value='@Autowired']]
                            //fieldDeclaration//variableDeclaratorId |
                         //classBodyDeclaration[//annotation[@value='@Inject']]
                            //fieldDeclaration//variableDeclaratorId`;

export function findInjectedFields(p: Project,
                                   globPattern: string = JavaSourceFiles): Promise<FileWithInjectedFields[]> {
    return findFileMatches(p, JavaFileParser, globPattern, InjectedFields)
        .then(fileHits => fileHits.map(fh => ({
            file: fh.file,
            fieldNames: fh.matches.map(m => m.$value),
        })));
}
