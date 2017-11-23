import { JavaFileParser } from "@atomist/antlr/tree/ast/antlr/java/JavaFileParser";
import { SimpleProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { JavaSourceFiles } from "@atomist/automation-client/operations/generate/java/javaProjectUtils";
import { findFileMatches, findMatches, zapAllMatches } from "@atomist/automation-client/tree/ast/astUtils";

import { HandleCommand } from "@atomist/automation-client";
import { BaseEditorParameters } from "@atomist/automation-client/operations/edit/BaseEditorParameters";
import { PullRequest } from "@atomist/automation-client/operations/edit/editModes";
import {
    editorHandler,
} from "@atomist/automation-client/operations/edit/editorToCommand";
import { File } from "@atomist/automation-client/project/File";
import { Project } from "@atomist/automation-client/project/Project";

const UnnecessaryComponentScanAnnotations = `//typeDeclaration[/classDeclaration]
                            [//annotation[@value='@SpringBootApplication']]
                            //annotation[@value='@ComponentScan']`;

const Constructors = `//classBodyDeclaration[//constructorDeclaration]`;

// Look at constructor assignments LHS or just bodies. Then look at fields to see if they're non final. Can run again
// against AST
const NonFinalFieldInjectedIntoConstructor = `//classBodyDeclaration[//constructorDeclaration]`;

// TODO will eventually use OR predicates - for Inject
const InjectedFields = `//classBodyDeclaration[//annotation[@value='@Autowired']]
                            //fieldDeclaration//variableDeclaratorId |
                         //classBodyDeclaration[//annotation[@value='@Inject']]
                            //fieldDeclaration//variableDeclaratorId`;

export const removeUnnecessaryComponentScanEditor: SimpleProjectEditor = p => {
    // TODO needs whitespace arg
    return zapAllMatches(p, JavaFileParser, JavaSourceFiles, UnnecessaryComponentScanAnnotations);
};

export const removeUnnecessaryComponentScanCommand: HandleCommand =
    editorHandler(removeUnnecessaryComponentScanEditor,
        BaseEditorParameters,
        "RemoveUnnecessaryComponentScanAnnotations", {
            description: "Remove unnecessary component scan annotations",
            editMode: new PullRequest("remove-unnecessary-component-scan", "Remove unnecessary component scan annotations",
                "`@ComponentScan` annotations are not necessary on `@SpringBootApplication` classes as they are inherited"),
            intent: "remove unnecessary component scan",
            tags: ["spring", "boot", "java"],
        },
    );

export const removeAutowiredOnSoleConstructor: SimpleProjectEditor = p => {
    return findMatches(p, JavaFileParser, JavaSourceFiles, Constructors)
        .then(constructors => {
            if (constructors.length === 1 && constructors[0].$value.includes("@Autowired")) {
                constructors[0].$value = constructors[0].$value.replace(/@Autowired[\s]+/, "");
            }
            return p.flush();
        });
};

export const removeAutowiredOnSoleConstructorCommand: HandleCommand =
    editorHandler(removeAutowiredOnSoleConstructor,
        BaseEditorParameters,
        "RemoveAutowiredOnSoleConstructor",
        {
            tags: ["spring", "boot", "java"],
        }
    );

export interface FileWithInjectedFields {

    file: File;
    fieldNames: string[];
}

/**
 * Return injected fields
 * @param {Project} p
 * @param {string} globPattern
 * @return {Promise<FileWithInjectedFields[]>}
 */
export function findInjectedFields(p: Project,
                                   globPattern: string = JavaSourceFiles): Promise<FileWithInjectedFields[]> {
    return findFileMatches(p, JavaFileParser, globPattern, InjectedFields)
        .then(fileHits => fileHits.map(fh => ({
            file: fh.file,
            fieldNames: fh.matches.map(m => m.$value),
        })));
}
