/*
 * Copyright © 2017 Atomist, Inc.
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

import { KotlinFileParser } from "@atomist/antlr/tree/ast/antlr/kotlin/KotlinFileParser";
import { logger } from "@atomist/automation-client/internal/util/logger";
import { ProjectAsync } from "@atomist/automation-client/project/Project";
import { findFileMatches } from "@atomist/automation-client/tree/ast/astUtils";
import { evaluateScalarValue } from "@atomist/tree-path/path/expressionEngine";
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
    // Run a path expression against the Kotlin ANTLR grammar
    return findFileMatches(p, KotlinFileParser, KotlinSourceFiles,
        "//classDeclaration[//annotation[@value='@SpringBootApplication']]/simpleIdentifier")
        .then(files => {
            if (files.length !== 1) {
                return undefined;
            } else {
                const f = files[0];
                const appClass = f.matches[0].$value;
                // Use the AST from the matching file to extract the package
                const packageName = evaluateScalarValue(f.fileNode, "//packageHeader/identifier");
                logger.info(`Spring Boot inference: packageName=${packageName}, appClass=${appClass}`);
                return (packageName && appClass) ?
                    new SpringBootProjectStructure(packageName, appClass, f.file) :
                    undefined;
            }
        });
}
