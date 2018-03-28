/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
