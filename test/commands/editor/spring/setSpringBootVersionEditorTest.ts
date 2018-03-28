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

import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import * as assert from "power-assert";
import { setSpringBootVersionEditor } from "../../../../src/commands/editor/spring/setSpringBootVersionEditor";
import { tempProject } from "../../../util/tempProject";
import { springBootPom } from "../../reviewer/maven/Poms";

describe("setSpringBootVersionEditor", () => {

    it("doesn't edit empty project", done => {
        const p = new InMemoryProject();
        setSpringBootVersionEditor("1.3.1")(p)
            .then(() => done(), done);
    });

    it("actually edits Spring Boot project in memory", done => {
        const p = InMemoryProject.of({ path: "pom.xml", content: springBootPom("1.3.0") });
        setSpringBootVersionEditor("1.3.1")(p)
            .then(r => {
                assert(p.findFileSync("pom.xml").getContentSync().includes("1.3.1"));
            }).then(() => done(), done);
    });

    it("actually edits Spring Boot project on disk", done => {
        const p = tempProject();
        p.addFileSync("pom.xml", springBootPom("1.3.0"));
        setSpringBootVersionEditor("1.3.1")(p)
            .then(r => {
                assert(p.findFileSync("pom.xml").getContentSync().includes("1.3.1"));
            }).then(() => done(), done);
    });

});
