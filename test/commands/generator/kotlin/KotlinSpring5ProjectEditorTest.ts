/*
 * Copyright © 2017 Atomist, Inc.
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
import {
    kotlinSeedTransformation,
    KotlinSpring5Parameters,
} from "../../../../src/commands/generator/spring/kotlinSpring5Generator";
import { GishPath, GishProject } from "./kotlinSpringBootStructureInferenceTest";

describe("Kotlin Spring5 project editor", () => {

    it("edits project and verifies package", done => {
        edit(GishProject, "my-custom", "atomist", "com.the.smiths", "MyCustom")
            .then(p => {
                verifyPackage(p);
                done();
            }).catch(done);
    });

    it("should edit POM", done => {
        const artifact = "my-custom";
        const group = "atomist";
        const project = InMemoryProject.of({ path: "pom.xml", content: SimplePom });
        edit(project, artifact, group, "com.the.smiths", "MyCustom")
            .then(p => {
                const found = p.findFileSync("pom.xml");
                const newPom = found.getContentSync();
                assert(newPom.includes(`<artifactId>${artifact}</artifactId>`));
                assert(newPom.includes(`<groupId>${group}</groupId>`));
                done();
            }).catch(done);
    });
});

function edit(project: Project, artifactId: string, groupId: string, rootPackage: string, serviceName: string): Promise<Project> {
    const kgen = new KotlinSpring5Parameters();
    kgen.artifactId = artifactId;
    kgen.groupId = groupId;
    kgen.rootPackage = rootPackage;
    kgen.serviceClassName = serviceName;
    kgen.bindAndValidate();
    const gen = kotlinSeedTransformation(kgen);
    return gen(project)
        .then(() => {
            return project;
        });
}

function verifyPackage(p: Project) {
    assert(!p.findFileSync(GishPath));
    const f = p.findFileSync("src/main/kotlin/com/the/smiths/MyCustom.kt");
    assert(f);
    const content = f.getContentSync();
    assert(content.includes("class MyCustom"));
}

// Minimal POM we can check is updated
export const SimplePom = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>flux-flix-service</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>flux-flix-service</name>
    <description>Demo project for Spring Boot</description>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.0.0.BUILD-SNAPSHOT</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>`;
