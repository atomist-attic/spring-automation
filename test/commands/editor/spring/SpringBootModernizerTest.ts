import * as _ from "lodash";
import "mocha";

import { HandlerContext } from "@atomist/automation-client/HandlerContext";
import { ConsoleMessageClient } from "@atomist/automation-client/internal/message/ConsoleMessageClient";
import { RepoFinder } from "@atomist/automation-client/operations/common/repoFinder";
import { RepoId, SimpleRepoId } from "@atomist/automation-client/operations/common/RepoId";
import { RepoLoader } from "@atomist/automation-client/operations/common/repoLoader";
import { ProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import { Project } from "@atomist/automation-client/project/Project";
import * as assert from "power-assert";
import { ProjectMatch, SpringBootModernizer } from "../../../../src/commands/editor/spring/SpringBootModernizer";
import { NonSpringPom, springBootPom } from "../../reviewer/maven/Poms";

class TestModernizer extends SpringBootModernizer {

    public edits = 0;
    public versions: string[] = [];

    private readonly rf: RepoFinder;
    private readonly rl: RepoLoader;

    // TODO could share this logic with version updater test
    constructor(private repos: Array<{ repoId: RepoId, project: Project }>) {
        super();
        // Prevent querying of github
        this.local = true;
        this.rf = ctx => Promise.resolve(repos.map(r => r.repoId));
        this.rl = id => {
            const found = repos.find(repo => repo.repoId === id);
            if (!found) {
                throw new Error(`Cannot find repo`);
            }
            return Promise.resolve(found.project);
        };
    }

    protected repoFinder() {
        return this.rf;
    }

    protected repoLoader(): RepoLoader {
        return this.rl;
    }

    protected doEdit(context: HandlerContext, p: ProjectMatch, editor: ProjectEditor<any>,
                     desiredVersion: string): Promise<any> {
        this.edits++;
        this.versions.push(desiredVersion);
        this.versions = _.uniq(this.versions);
        return Promise.resolve(true);
    }
}

describe("SpringBootModernizer", () => {

    it("no comments for no matching artifact", done => {
        const project = InMemoryProject.of({ path: "pom.xml", content: NonSpringPom });
        const repoId: RepoId = new SimpleRepoId("a", "b");

        const vs = new TestModernizer([{ repoId, project }]);

        vs.handle({ messageClient: new ConsoleMessageClient() } as any).then(hr => {
            assert(hr.code === 0);
            assert(vs.edits === 0);
            done();
        }).catch(done);
    });

    it("finds version of matching artifact in single project: nothing to do", done => {
        const project = InMemoryProject.of({ path: "pom.xml", content: springBootPom("1.3.0") });
        const repoId: RepoId = new SimpleRepoId("a", "b");

        const vs = new TestModernizer([{ repoId, project }]);

        vs.handle({ messageClient: new ConsoleMessageClient() } as any).then(hr => {
            assert(hr.code === 0);
            assert(vs.edits === 0);
            done();
        }).catch(done);
    });

    it("upgrades one project", done => {
        const project1 = InMemoryProject.of({ path: "pom.xml", content: springBootPom("1.3.0") });
        const project2 = InMemoryProject.of({ path: "pom.xml", content: springBootPom("1.5.2") });

        const repoId1: RepoId = new SimpleRepoId("a", "b");
        const repoId2: RepoId = new SimpleRepoId("a", "c");

        const vs = new TestModernizer([
            { repoId: repoId1, project: project1 },
            { repoId: repoId2, project: project2 },
        ]);

        vs.handle({ messageClient: new ConsoleMessageClient() } as any)
            .then(hr => {
                assert(hr.code === 0);
                assert(vs.edits === 1);
                assert.deepEqual(vs.versions, ["1.5.2"]);
                done();
            }).catch(done);
    });

});
