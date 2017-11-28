import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import { findInjectedFields } from "../../../../src/commands/editor/spring/FindInjectedFields";

import * as assert from "power-assert";

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
        const content = "public class MyApp { @Autowired private String dog; @Autowired public MyApp(Thing t) {} }";
        const p = InMemoryProject.of(
            {path, content});
        findInjectedFields(p)
            .then(r => {
                assert(r.length === 1);
                assert.deepEqual(r[0].fields.map(f => f.name), [ "dog"]);
                done();
            }).catch(done);
    });

    it("finds @Inject field", done => {
        const path = "src/main/java/Foo.java";
        const content = "public class MyApp { @Inject private String dog; @Autowired public MyApp(Thing t) {}}";
        const p = InMemoryProject.of(
            {path, content});
        findInjectedFields(p)
            .then(r => {
                assert(r.length === 1);
                assert.deepEqual(r[0].fields.map(f => f.name), [ "dog"]);
                r[0].fields.forEach(f => {
                    assert(f.offset > 0);
                    assert(content.substr(f.offset, f.name.length) === f.name);
                });
                done();
            }).catch(done);
    });
});
