import { JavaFileParser } from "@atomist/antlr/tree/ast/antlr/java/JavaFileParser";
import { SimpleProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { findMatches } from "@atomist/automation-client/tree/ast/astUtils";

import { HandleCommand } from "@atomist/automation-client";
import { BaseEditorOrReviewerParameters } from "@atomist/automation-client/operations/common/params/BaseEditorOrReviewerParameters";
import { editorHandler } from "@atomist/automation-client/operations/edit/editorToCommand";
import { JavaSourceFiles } from "../../generator/java/javaProjectUtils";
import { SpringBootEditorTags } from "./springConstants";

const Constructors = `//classBodyDeclaration[//constructorDeclaration]`;

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
