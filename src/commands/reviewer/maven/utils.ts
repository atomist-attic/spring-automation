/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { PropertiesGrammar } from "../../../grammars/mavenGrammars";

/**
 * Parse the properties block of a POM and
 * replace references to them.
 * @param content
 * @returns {string}
 */
export function expandProperties(content: string): string {
    let expanded = content;
    // Stop after the first match
    const propsBlock = PropertiesGrammar.firstMatch(content);
    if (propsBlock) {
        for (const property of propsBlock.properties) {
            // console.log(`Name=${property.name}, value=${property.value}`);
            expanded = content.replace("${" + property.name + "}", property.value);
        }
    }
    return expanded;
}
