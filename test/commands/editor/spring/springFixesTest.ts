import "mocha";

import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import * as assert from "power-assert";
import {
    findInjectedFields,
    removeAutowiredOnSoleConstructor,
    removeUnnecessaryComponentScanEditor,
} from "../../../../src/commands/editor/spring/springFixes";

describe("springFixes", () => {

    describe("removeUnnecesaryComponentScanEditor", () => {

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
                    assert(f.getContentSync() === content.replace("@ComponentScan", ""));
                    done();
                }).catch(done);
        });

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

    describe("find injected fields", () => {

        it("finds none in empty project", done => {
            const p = new InMemoryProject();
            findInjectedFields(p)
                .then(r => {
                    assert(r.length === 0);
                    done();
                }).catch(done);
        });

        it("finds none in a Java file", done => {
            const path = "src/main/java/Foo.java";
            const content = "public class MyApp { private String dog; @Autowired public MyApp(Thing t) {} }";
            const p = InMemoryProject.of(
                {path, content});
            findInjectedFields(p)
                .then(r => {
                    assert(r.length === 0);
                    done();
                }).catch(done);
        });

        it("finds @Autowired field", done => {
            const path = "src/main/java/Foo.java";
            const content = "public class MyApp { @Autowired private String dog; @Autowired public MyApp(Thing t) {} @Autowired public MyApp(Thing t, OtherThing ot) {} }";
            const p = InMemoryProject.of(
                {path, content});
            findInjectedFields(p)
                .then(r => {
                    assert(r.length === 1);
                    assert.deepEqual(r[0].fieldNames, [ "dog"]);
                    done();
                }).catch(done);
        });
    });

    it.skip("finds @Inject field", done => {
        const path = "src/main/java/Foo.java";
        const content = "public class MyApp { @Inject private String dog; @Autowired public MyApp(Thing t) {}}";
        const p = InMemoryProject.of(
            {path, content});
        findInjectedFields(p)
            .then(r => {
                assert(r.length === 1);
                assert.deepEqual(r[0].fieldNames, [ "dog"]);
                done();
            }).catch(done);
    });

});
