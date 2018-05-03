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

import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import { Project } from "@atomist/automation-client/project/Project";
import * as assert from "power-assert";
import { inferFromKotlinSource } from "../../../../src/commands/generator/kotlin/kotlinUtils";

describe("Spring Boot structure inference from Kotlin source", () => {

    it("infer not a spring project", done => {
        const p = InMemoryProject.of();
        inferFromKotlinSource(p).then(structure => {
            assert(!structure);
            done();
        }).catch(done);
    });

    it("should not be fooled by foo.kotlin.txt", done => {
        const p = InMemoryProject.of(
            {
                path: "src/main/kotlin/com/smashing/pumpkins/Gish.kt.txt",
                content: kotlinSource,
            },
        );
        inferFromKotlinSource(p).then(structure => {
            assert(!structure);
            done();
        }).catch(done);
    });

    it("infer application package and class when present", done => {
        inferFromKotlinSource(GishProject).then(structure => {
            assert(structure.applicationPackage === "com.smashing.pumpkins");
            assert(structure.appClassFile.path === GishPath);
            done();
        }).catch(done);
    });

});

const kotlinSource =
    `package com.smashing.pumpkins

@SpringBootApplication
class GishApplication {
}

`;

export const GishPath = "src/main/kotlin/com/smashing/pumpkins/Gish.kt";
export const GishProject: Project = InMemoryProject.of(
    {
        path: GishPath,
        content: kotlinSource,
    },
);
