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
import {
    removeAutowiredOnSoleConstructor,
} from "../../../../src/commands/editor/spring/removeUnnecessaryAutowiredAnnotations";
import { removeUnnecessaryComponentScanEditor } from "../../../../src/commands/editor/spring/removeUnnecessaryComponentScanAnnotations";

describe("remove unnecessary annotations", () => {

    describe("removeUnnecessaryComponentScanEditor", () => {

        it("doesn't fail on empty project", done => {
            const p = new InMemoryProject();
            removeUnnecessaryComponentScanEditor(p, null)
                .then(r => {
                    done();
                }).catch(done);
        });

        it("removes unnecessary annotation", done => {
            const path = "src/main/java/Foo.java";
            const content = "public @SpringBootApplication @ComponentScan class MyApp {}";
            const p = InMemoryProject.of(
                {path, content});
            removeUnnecessaryComponentScanEditor(p, null)
                .then(r => {
                    const f = r.findFileSync(path);
                    assert(f.getContentSync() === content.replace("@ComponentScan ", ""));
                    done();
                }).catch(done);
        });

        it("also removes import if only one use");

        it("does not remove import if multiple uses");

        it("doesn't remove necessary annotation", done => {
            const path = "src/main/java/Foo.java";
            const content = "public @ComponentScan class MyApp {}";
            const p = InMemoryProject.of(
                {path, content});
            removeUnnecessaryComponentScanEditor(p, null)
                .then(r => {
                    const f = r.findFileSync(path);
                    assert(f.getContentSync() === content);
                    done();
                }).catch(done);
        });
    });

    describe("removeAutowiredOnSoleConstructor", () => {

        it("doesn't fail on empty project", done => {
            const p = new InMemoryProject();
            removeAutowiredOnSoleConstructor(p, null)
                .then(r => {
                    done();
                }).catch(done);
        });

        it("removes unnecessary annotation", done => {
            const path = "src/main/java/Foo.java";
            const content = "public class MyApp { @Autowired public MyApp(Thing t) {} }";
            const p = InMemoryProject.of(
                {path, content});
            removeAutowiredOnSoleConstructor(p, null)
                .then(r => {
                    const f = r.findFileSync(path);
                    assert(f.getContentSync() === content.replace("@Autowired ", ""));
                    done();
                }).catch(done);
        });

        it("also removes import if only one use");

        it("does not remove import if multiple uses");

        it("doesn't remove necessary annotation", done => {
            const path = "src/main/java/Foo.java";
            const content = "public class MyApp { @Autowired public MyApp(Thing t) {} @Autowired public MyApp(Thing t, OtherThing ot) {} }";
            const p = InMemoryProject.of(
                {path, content});
            removeAutowiredOnSoleConstructor(p, null)
                .then(r => {
                    const f = r.findFileSync(path);
                    assert(f.getContentSync() === content);
                    done();
                }).catch(done);
        });
    });

});
