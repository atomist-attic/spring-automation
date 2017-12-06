import { JavaFileParser } from "@atomist/antlr/tree/ast/antlr/java/JavaFileParser";
import { SimpleProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { findMatches, zapAllMatches } from "@atomist/automation-client/tree/ast/astUtils";

import { HandleCommand } from "@atomist/automation-client";
import { BaseEditorOrReviewerParameters } from "@atomist/automation-client/operations/common/params/BaseEditorOrReviewerParameters";
import { PullRequest } from "@atomist/automation-client/operations/edit/editModes";
import { editorHandler } from "@atomist/automation-client/operations/edit/editorToCommand";
import { ZapTrailingWhitespace } from "@atomist/automation-client/tree/ast/FileHits";
import { JavaSourceFiles } from "../../generator/java/javaProjectUtils";
import { SpringBootEditorTags } from "./springConstants";

const UnnecessaryComponentScanAnnotations = `//typeDeclaration[/classDeclaration]
                            [//annotation[@value='@SpringBootApplication']]
                            //annotation[@value='@ComponentScan']`;

const Constructors = `//classBodyDeclaration[//constructorDeclaration]`;

export const removeUnnecessaryComponentScanEditor: SimpleProjectEditor = p => {
    return zapAllMatches(p, JavaFileParser, JavaSourceFiles,
        UnnecessaryComponentScanAnnotations,
        ZapTrailingWhitespace);
};

export const removeUnnecessaryComponentScanCommand: HandleCommand =
    editorHandler(() => removeUnnecessaryComponentScanEditor,
        BaseEditorOrReviewerParameters,
        "RemoveUnnecessaryComponentScanAnnotations", {
            description: "Remove unnecessary component scan annotations",
            editMode: new PullRequest("remove-unnecessary-component-scan", "Remove unnecessary component scan annotations",
                "`@ComponentScan` annotations are not necessary on `@SpringBootApplication` classes as they are inherited"),
            intent: "remove unnecessary component scan",
            tags: SpringBootEditorTags,
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
    editorHandler(() => removeAutowiredOnSoleConstructor,
        BaseEditorOrReviewerParameters,
        "RemoveAutowiredOnSoleConstructor",
        {
            description: "Remove @Autowired on sole constructor as it's not necessary",
            tags: SpringBootEditorTags,
            intent: "remove unnecessary Autowired",
        },
    );
