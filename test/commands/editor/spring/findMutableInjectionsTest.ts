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
import { findMutableInjections, MutableInjection } from "../../../../src/commands/editor/spring/findMutableInjections";

import * as assert from "power-assert";

describe("find mutable injections", () => {

    it("finds none in empty project", done => {
        const p = new InMemoryProject();
        findMutableInjections(p)
            .then(pr => {
                assert(pr.comments.length === 0);
                done();
            }).catch(done);
    });

    it("finds none in a Java file", done => {
        const path = "src/main/java/Foo.java";
        const content = "public class MyApp { private String dog; @Autowired public MyApp(Thing t) {} }";
        const p = InMemoryProject.of(
            {path, content});
        findMutableInjections(p)
            .then(pr => {
                assert(pr.comments.length === 0);
                done();
            }).catch(done);
    });

    it("finds @Autowired field", done => {
        const path = "src/main/java/Foo.java";
        const content = "public class MyApp { @Autowired private String dog; @Autowired public MyApp(Thing t) {} }";
        const p = InMemoryProject.of(
            {path, content});
        findMutableInjections(p)
            .then(pr => {
                assert(pr.comments.length === 1);
                const c = pr.comments[0] as MutableInjection;
                assert(c.name === "dog");
                assert(c.type === "field");
                assert(c.sourceLocation.path === path);
                assert(c.sourceLocation.lineFrom1 === 1);
                assert(c.sourceLocation.columnFrom1 > 1);
                done();
            }).catch(done);
    });

    it("finds @Inject field", done => {
        const path = "src/main/java/Foo.java";
        const content = "public class MyApp { @Inject private String dog; @Autowired public MyApp(Thing t) {}}";
        const p = InMemoryProject.of(
            {path, content});
        findMutableInjections(p)
            .then(r => {
                assert(r.comments.length === 1);
                assert((r.comments[0] as MutableInjection).name === "dog");
                r.comments.forEach(c => {
                    const f = c as MutableInjection;
                    assert(f.sourceLocation.offset > 0);
                    assert(content.substr(f.sourceLocation.offset, f.name.length) === f.name);
                });
                done();
            }).catch(done);
    });

    it("finds @Autowired setter", done => {
        const path = "src/main/java/Foo.java";
        const content = "public class MyApp { private String dog; " +
            "@Autowired public void setDog(String dog) { this.dog = dog; } @Autowired public MyApp(Thing t) {} }";
        const p = InMemoryProject.of(
            {path, content});
        findMutableInjections(p)
            .then(r => {
                assert(r.comments.length === 1);
                assert((r.comments[0] as MutableInjection).type === "setter");
                assert((r.comments[0] as MutableInjection).name === "setDog");
                done();
            }).catch(done);
    });
});
