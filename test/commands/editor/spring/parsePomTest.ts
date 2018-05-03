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

import { FromInitializr } from "./addStarterEditorTest";
import { identification } from "./pomParser";

import * as assert from "power-assert";

describe("POM parsing", () => {

    it("parses initializr project", done => {
        const content = FromInitializr;
        identification(content)
            .then(parsed => {
                assert(parsed.group === "com.example");
                assert(parsed.artifact === "demo");
                assert(parsed.version === "0.0.1-SNAPSHOT");
                done();
            }).catch(done);
    });

});
