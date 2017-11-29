import "mocha";

import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import * as assert from "power-assert";
import {
    removeAutowiredOnSoleConstructor,
    removeUnnecessaryComponentScanEditor,
} from "../../../../src/commands/editor/spring/removeUnnecessaryAnnotations";

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
