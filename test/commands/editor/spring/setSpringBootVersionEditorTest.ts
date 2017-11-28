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
            .then(r => {
                done();
            }).catch(done);
    });

    it("actually edits Spring Boot project in memory", done => {
        const p = InMemoryProject.of({ path: "pom.xml", content: springBootPom("1.3.0") });
        setSpringBootVersionEditor("1.3.1")(p, null)
            .then(r => {
                assert(p.findFileSync("pom.xml").getContentSync().includes("1.3.1"));
                done();
            }).catch(done);
    });

    it("actually edits Spring Boot project on disk", done => {
        const p = tempProject();
        p.addFileSync("pom.xml", springBootPom("1.3.0"));
        setSpringBootVersionEditor("1.3.1")(p, null)
            .then(r => {
                assert(p.findFileSync("pom.xml").getContentSync().includes("1.3.1"));
                done();
            }).catch(done);
    });

});
