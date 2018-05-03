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

import * as assert from "power-assert";
import { verifyPom } from "../../../../src/commands/editor/spring/verifyPom";
import { springBootPom } from "../../reviewer/maven/Poms";

describe("verify POM", () => {

    it("finds none in empty project", done => {
        const p = new InMemoryProject();
        verifyPom(p)
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
        verifyPom(p)
            .then(r => {
                assert(r.comments.length === 0);
                done();
            }).catch(done);
    });

    it("accepts POM with valid parent", done => {
        const content = springBootPom("1.5.9");
        const p = InMemoryProject.of(
            { path: "pom.xml", content });
        verifyPom(p)
            .then(r => {
                assert(r.comments.length === 0);
                done();
            }).catch(done);
    });

    it("finds problem in bad spring boot", done => {
        const p = InMemoryProject.of(
            { path: "pom.xml", content:
                springBootPom("1.3.1", "my-weird-parent") });
        verifyPom(p)
            .then(r => {
                assert(r.comments.length === 1);
                assert(r.comments[0].sourceLocation.path === "pom.xml");
                done();
            }).catch(done);
    });

    it("finds no problem because not spring boot", done => {
        const p = InMemoryProject.of(
            { path: "pom.xml", content: "<xml></xml>" });
        verifyPom(p)
            .then(r => {
                assert(r.comments.length === 0);
                done();
            }).catch(done);
    });
});
