import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import "mocha";
import * as assert from "power-assert";
import {
    springBootVersionUpgrade,
    SpringBootVersionUpgradeParameters
} from "../../../../src/commands/editor/spring/SpringBootVersionUpgrade";
import { NonSpringPom, springBootPom } from "../../reviewer/maven/Poms";
import { fromListRepoFinder } from "@atomist/automation-client/operations/common/fromProjectList";
import { RepoRef, SimpleRepoId } from "@atomist/automation-client/operations/common/RepoId";
import { CustomExecutionEditMode } from "@atomist/automation-client/operations/edit/editModes";
import { Project } from "@atomist/automation-client/project/Project";
import { EditResult, ProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { HandlerContext } from "@atomist/automation-client";
import { RepoLoader } from "@atomist/automation-client/operations/common/repoLoader";

describe("springBootVersionUpgrade", () => {

    it("does nothing to non Spring project", done => {
        const proj = InMemoryProject.from(new SimpleRepoId("foo", "bar"), {path: "pom.xml", content: NonSpringPom});
        const rf = fromListRepoFinder([proj]);
        (springBootVersionUpgrade(rf) as any).handle(null, new SpringBootVersionUpgradeParameters())
            .then(() => {
                done();
            }).catch(done);
    });

    it("does nothing when project is already up to date", done => {
        const proj = InMemoryProject.of({
            path: "pom.xml",
            content: springBootPom(new SpringBootVersionUpgradeParameters().desiredBootVersion),
        });
        const rf = fromListRepoFinder([proj]);
        (springBootVersionUpgrade(rf) as any).handle(null, new SpringBootVersionUpgradeParameters())
            .then(() => {
                done();
            }).catch(done);
    });

    it.skip("comment for old Spring project", done => {
        let verified = false;
        const v = "1.3.0";
        const proj = InMemoryProject.of({path: "pom.xml", content: springBootPom(v)});
        const rf = fromListRepoFinder([proj]);
        (springBootVersionUpgrade(rf, p => fromListRepoLoader([proj]),
            new VerifyEditMode(p => {
                const updated = p.findFileSync("pom.xml");
                assert(!updated.getContentSync().includes(v));
                assert(updated.getContentSync().includes(new SpringBootVersionUpgradeParameters().desiredBootVersion));
                verified = true;
            })) as any).handle(null, new SpringBootVersionUpgradeParameters())
            .then(() => {
                assert(verified, "Not verified");
                done();
            }).catch(done);
    });

});

class VerifyEditMode implements CustomExecutionEditMode {

    public message = "foo";

    constructor(private assertions: (p: Project) => void) {

    }

    public edit<P>(p: Project, action: ProjectEditor<P>, context: HandlerContext, parameters: P): Promise<EditResult> {
        return action(p, context, parameters)
            .then(er => {
                this.assertions(p);
                return er;
            });
    }
}

export function fromListRepoLoader(projects: Project[]): RepoLoader {
    return (id: RepoRef) => {
        console.log("Loading repo " + JSON.stringify(id));
        return Promise.resolve(projects.find(p => p.id === id));
    }
}
