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

import "mocha";

import * as assert from "power-assert";

import { dependencyOfGrammar } from "../../../../src/grammars/mavenGrammars";
import { springBootPom } from "./Poms";

describe("dependency grammar", () => {

    it("finds no match", () => {
        const matches = dependencyOfGrammar("xxxcommons-io", "xxxcommons-io")
            .findMatches(springBootPom("1.3.1"));
        assert(matches.length === 0);
    });

    it("finds a match", () => {
        const matches = dependencyOfGrammar("commons-io", "commons-io")
            .findMatches(springBootPom("1.3.1"));
        assert(matches.length === 1);
        assert(matches[0].gav.version === "2.5");
    });
});
