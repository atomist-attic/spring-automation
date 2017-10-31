import { ConsoleMessageClient } from "@atomist/automation-client/internal/message/ConsoleMessageClient";
import { RepoId, SimpleRepoId } from "@atomist/automation-client/operations/common/RepoId";
import { ProjectReviewer } from "@atomist/automation-client/operations/review/projectReviewer";
import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import "mocha";
import * as assert from "power-assert";
import { SpringBootVersionReviewer } from "../../../../src/commands/reviewer/spring/SpringBootVersionReviewer";
import { NonSpringPom, springBootPom } from "../maven/Poms";

describe("SpringBootVersionReviewer", () => {

    function reviewer(): ProjectReviewer {
        return new SpringBootVersionReviewer().projectReviewer();
    }

    it("no comments for non Spring project", done => {
        const proj = InMemoryProject.of({ path: "pom.xml", content: NonSpringPom });
        const id: RepoId = new SimpleRepoId("a", "b");
        (proj as any).id = id;
        const ctx = { messageClient: new ConsoleMessageClient() } as any;
        reviewer()(proj, ctx).then(r => {
            const rev = r as any;
            assert(rev.repoId.owner === id.owner);
            assert(rev.repoId.repo === id.repo);
            assert(rev.comments.length === 0);
            assert(!rev.desiredVersion);
            assert(!rev.version);
            done();
        }).catch(done);
    });

    it("comment for old Spring project", done => {
        const v = "1.3.0";
        const proj = InMemoryProject.of({ path: "pom.xml", content: springBootPom(v) });
        const id: RepoId = new SimpleRepoId("a", "b");
        (proj as any).id = id;
        const ctx = { messageClient: new ConsoleMessageClient() } as any;
        reviewer()(proj, ctx)
            .then(r => {
                const rev = r as any;
                assert(rev.repoId.owner === id.owner);
                assert(rev.repoId.repo === id.repo);
                assert(rev.comments.length === 1);
                assert(rev.desiredVersion === new SpringBootVersionReviewer().desiredBootVersion);
                assert(rev.version === v, rev.version);
                done();
            }).catch(done);
    });

});
