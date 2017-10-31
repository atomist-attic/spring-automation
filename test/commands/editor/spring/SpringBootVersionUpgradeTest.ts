import "mocha";

import { RepoId, SimpleRepoId } from "@atomist/automation-client/operations/common/RepoId";
import { ProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import * as assert from "power-assert";
import { SpringBootVersionUpgrade } from "../../../../src/commands/editor/spring/SpringBootVersionUpgrade";
import { NonSpringPom, springBootPom } from "../../reviewer/maven/Poms";

describe("SpringBootVersionUpgrade", () => {

    function editor(): ProjectEditor<any> {
        return new SpringBootVersionUpgrade().projectEditor();
    }

    it("does nothing to non Spring project", done => {
        const proj = InMemoryProject.of({ path: "pom.xml", content: NonSpringPom });
        editor()(proj, null).then(er => {
            assert(!er.edited);
            done();
        }).catch(done);
    });

    it("does nothing when project is already up to date", done => {
        const proj = InMemoryProject.of({
            path: "pom.xml",
            content: springBootPom(new SpringBootVersionUpgrade().desiredBootVersion),
        });
        editor()(proj, null).then(er => {
            assert(!er.edited);
            done();
        }).catch(done);
    });

    it("comment for old Spring project", done => {
        const v = "1.3.0";
        const proj = InMemoryProject.of({ path: "pom.xml", content: springBootPom(v) });
        editor()(proj, null).then(er => {
            assert(er.edited);
            const updated = proj.findFileSync("pom.xml");
            assert(!updated.getContentSync().includes(v));
            assert(updated.getContentSync().includes(new SpringBootVersionUpgrade().desiredBootVersion));
            done();
        }).catch(done);
    });

});
