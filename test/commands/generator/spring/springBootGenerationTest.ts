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

import { metadataFromInstance } from "@atomist/automation-client/internal/metadata/metadataReading";
import { CommandHandlerMetadata } from "@atomist/automation-client/metadata/automationMetadata";
import { EditResult, toEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { Project } from "@atomist/automation-client/project/Project";
import * as assert from "power-assert";
import {
    springBootGenerator,
    springBootProjectEditor,
} from "../../../../src/commands/generator/spring/springBootGenerator";
import { GishJavaPath, GishProject } from "./SpringBootProjectStructureTest";

const GroupId = "group";
const ArtId = "art";
const Version = "1.0.7";

describe("Spring Boot generation", () => {

    it("edits project and verifies package", done => {
        edit(GishProject).then(r => {
            assert(!r.target.findFileSync(GishJavaPath));
            const f = r.target.findFileSync("src/main/java/com/the/smiths/MyCustom.java");
            assert(f);
            const content = f.getContentSync();
            assert(content.includes("class MyCustom"));
        }).then(done, done);
    });

    it("edits project and verifies POM", done => {
        edit(GishProject).then(r => {
            assert(!r.target.findFileSync(GishJavaPath));
            const f = r.target.findFileSync("pom.xml");
            assert(f);
            const content = f.getContentSync();
            assert(!content.includes("undefined"));
        }).then(done, done);
    });

    function edit(project: Project): Promise<EditResult> {
        const sbs = springBootGenerator();
        const params = sbs.freshParametersInstance();
        params.serviceClassName = "MyCustom";
        params.groupId = GroupId;
        params.version = Version;
        params.artifactId = ArtId;
        params.rootPackage = "com.the.smiths";
        params.bindAndValidate();

        const md = metadataFromInstance(sbs) as CommandHandlerMetadata;
        assert(md.name === "springBootGenerator");
        assert(md.parameters.length > 5);

        const ctx = null;
        return toEditor(springBootProjectEditor(params))(project, ctx, null);
    }

});
