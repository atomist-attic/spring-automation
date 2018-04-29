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

import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import * as assert from "power-assert";
import { movePackage } from "../../../../src/commands/generator/java/javaProjectUtils";
import { AllKotlinFiles, inferFromKotlinSource } from "../../../../src/commands/generator/kotlin/kotlinUtils";

describe("package move", () => {

    it("moves files", done => {
        const path = "src/main/kotlin/com/smashing/pumpkins/Gish.kt";
        const p = InMemoryProject.of(
            {
                path,
                content: kotlinSource,
            },
        );
        inferFromKotlinSource(p).then(structure => {
            assert(structure.applicationPackage === "com.smashing.pumpkins");
            assert(structure.appClassFile.path === path);
            return movePackage(p, structure.applicationPackage, "com.the.smiths", AllKotlinFiles)
                .then(_ => {
                    assert(!p.findFileSync(path));
                    const newFile = p.findFileSync("src/main/kotlin/com/the/smiths/Gish.kt");
                    assert(!!newFile);
                    done();
                });
        }).catch(done);
    });

    it("moves files working with Kotlin by default", done => {
        const path = "src/main/kotlin/com/smashing/pumpkins/Gish.kt";
        const p = InMemoryProject.of(
            {
                path,
                content: kotlinSource,
            },
        );
        inferFromKotlinSource(p).then(structure => {
            assert(structure.applicationPackage === "com.smashing.pumpkins");
            assert(structure.appClassFile.path === path);
            return movePackage(p, structure.applicationPackage, "com.the.smiths")
                .then(_ => {
                    assert(!p.findFileSync(path));
                    const newFile = p.findFileSync("src/main/kotlin/com/the/smiths/Gish.kt");
                    assert(!!newFile);
                    done();
                });
        }).catch(done);
    });

});

const kotlinSource =
    `package com.smashing.pumpkins

@SpringBootApplication
class GishApplication {
}

`;
