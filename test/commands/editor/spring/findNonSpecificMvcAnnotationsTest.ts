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
import {
    findNonSpecificMvcAnnotations,
    NonSpecificMvcAnnotation,
} from "../../../../src/commands/editor/spring/findNonSpecificMvcAnnotations";

describe("find non specific MVC annoations", () => {

    it("finds none in empty project", done => {
        const p = new InMemoryProject();
        findNonSpecificMvcAnnotations(p)
            .then(r => {
                assert(r.comments.length === 0);
                done();
            }).catch(done);
    });

    it("finds none in a Java file", done => {
        const path = "src/main/java/Foo.java";
        const content = "public class MyApp { private String dog; @Autowired public MyApp(Thing t) {} }";
        const p = InMemoryProject.of(
            { path, content });
        findNonSpecificMvcAnnotations(p)
            .then(r => {
                assert(r.comments.length === 0);
                done();
            }).catch(done);
    });

    it("finds @RequestMapping default GET", done => {
        const path = "src/main/java/Foo.java";
        const content = "public class MyController { @RequestMapping public ResponseEntity<String> serviceCapabilitiesV2() {} }";
        const p = InMemoryProject.of(
            { path, content });
        findNonSpecificMvcAnnotations(p)
            .then(r => {
                assert(r.comments.length === 1);
                assert((r.comments[0] as NonSpecificMvcAnnotation).raw === "@RequestMapping");
                assert(r.comments[0].sourceLocation.path === path);
                assert(r.comments[0].sourceLocation.lineFrom1 === 1);
                assert(r.comments[0].sourceLocation.columnFrom1 > 1);
                done();
            }).catch(done);
    });

    it("finds @RequestMapping default POST", done => {
        const path = "src/main/java/Foo.java";
        const content = "public class MyController { @RequestMapping(method=POST) public ResponseEntity<String> serviceCapabilitiesV2() {} }";
        const p = InMemoryProject.of(
            { path, content });
        findNonSpecificMvcAnnotations(p)
            .then(r => {
                assert(r.comments.length === 1);
                assert((r.comments[0] as NonSpecificMvcAnnotation).raw === `@RequestMapping(method=POST)`);
                assert(r.comments[0].sourceLocation.path === path);
                assert(r.comments[0].sourceLocation.lineFrom1 === 1);
                assert(r.comments[0].sourceLocation.columnFrom1 > 1);
                done();
            }).catch(done);
    });
});
