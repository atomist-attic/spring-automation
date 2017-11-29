import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import { findMutableInjections } from "../../../../src/commands/editor/spring/findMutableInjections";

import * as assert from "power-assert";

describe("find mutable injections", () => {

    it("finds none in empty project", done => {
        const p = new InMemoryProject();
        findMutableInjections(p)
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
        findMutableInjections(p)
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
        findMutableInjections(p)
            .then(r => {
                assert(r.length === 1);
                assert(r[0].name === "dog");
                assert(r[0].type === "field");
                assert(r[0].sourceLocation.path === path);
                assert(r[0].sourceLocation.lineFrom1 === 1);
                assert(r[0].sourceLocation.columnFrom1 > 1);
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
                assert(r.length === 1);
                assert(r[0].name === "dog");
                r.forEach(f => {
                    assert(f.offset > 0);
                    assert(content.substr(f.offset, f.name.length) === f.name);
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
                assert(r.length === 1);
                assert(r[0].type === "setter");
                assert(r[0].name === "setDog");
                done();
            }).catch(done);
    });
});
