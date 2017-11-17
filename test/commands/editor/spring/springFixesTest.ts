import "mocha";

import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";

import { RepoId, SimpleRepoId } from "@atomist/automation-client/operations/common/RepoId";
import * as assert from "power-assert";
import { setSpringBootVersionEditor } from "../../../../src/commands/editor/spring/setSpringBootVersionEditor";
import { tempProject } from "../../../util/tempProject";
import { springBootPom } from "../../reviewer/maven/Poms";
import { removeUnnecesaryComponentScanEditor } from "../../../../src/commands/editor/spring/springFixes";

describe("springFixes", () => {

    describe("removeUnnecesaryComponentScanEditor", () => {

        it("doesn't fail on empty project", done => {
            const p = new InMemoryProject();
            removeUnnecesaryComponentScanEditor(p, null)
                .then(r => {
                    done();
                }).catch(done);
        });

        it("removes unnecessary annotation", done => {
            const path = "src/main/java/Foo.java";
            const content = "public @SpringBootApplication @ComponentScan class MyApp {}";
            const p = InMemoryProject.of(
                {path, content});
            removeUnnecesaryComponentScanEditor(p, null)
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
            removeUnnecesaryComponentScanEditor(p, null)
                .then(r => {
                    const f = r.findFileSync(path);
                    assert(f.getContentSync() === content);
                    done();
                }).catch(done);
        });
    });

});
