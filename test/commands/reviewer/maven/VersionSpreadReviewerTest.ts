import { SimpleRepoId } from "@atomist/automation-client/operations/common/RepoId";
import "mocha";

import { HandlerContext } from "@atomist/automation-client";
import { fromListRepoFinder, fromListRepoLoader } from "@atomist/automation-client/operations/common/fromProjectList";
import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import { MessageClient } from "@atomist/automation-client/spi/message/MessageClient";
import * as assert from "power-assert";
import {
    versionSpreadReviewerCommand,
    VersionSpreadReviewerParameters,
} from "../../../../src/commands/reviewer/maven/VersionSpreadReviewer";
import { NonSpringPom, springBootPom } from "./Poms";

describe("VersionSpreadReviewer", () => {

    // TODO need to re-enable these tests...probably need a different function approach

    const fakeContext: HandlerContext = {
        messageClient: {
            respond: () => Promise.resolve(),
        } as any as MessageClient,
    } as HandlerContext;

    it.skip("no comments for no matching artifact", done => {
        const project = InMemoryProject.from(new SimpleRepoId("a", "b"), {path: "pom.xml", content: NonSpringPom});

        const rf = fromListRepoFinder([project]);
        const rl = fromListRepoLoader([project]);

        const params = new VersionSpreadReviewerParameters();
        params.groupId = "none";
        params.artifactId = "nonsense";

        (versionSpreadReviewerCommand(rf, rl) as any).handle(fakeContext, params)
            .then(hr => {
                assert(hr.projectsReviewed === 1);
                assert(hr.projectReviews.length === 1);
                done();
            }).catch(done);
    });

    it.skip("finds version of matching artifact in single project", done => {
        const project = InMemoryProject.from(new SimpleRepoId("a", "b"), {path: "pom.xml", content: NonSpringPom});

        const rf = fromListRepoFinder([project]);
        const rl = fromListRepoLoader([project]);

        const params = new VersionSpreadReviewerParameters();
        params.groupId = "commons-io";
        params.artifactId = "commons-io";

        (versionSpreadReviewerCommand(rf, rl) as any).handle(fakeContext, params)
            .then(hr => {
                assert(hr.projectsReviewed === 1);
                assert(hr.projectReviews.length === 1);
                assert(hr.projectReviews[0].artifact === params.artifactId);
                assert(hr.projectReviews[0].group === params.groupId);
                assert(hr.projectReviews[0].version === "2.5");
                done();
            }).catch(done);
    });

    it.skip("aggregates single version in single project", done => {
        const project = InMemoryProject.from(new SimpleRepoId("a", "b"), {
            path: "pom.xml",
            content: springBootPom("1.3.0"),
        });

        const rf = fromListRepoFinder([project]);
        const rl = fromListRepoLoader([project]);

        const params = new VersionSpreadReviewerParameters();
        params.groupId = "commons-io";
        params.artifactId = "commons-io";

        // vs.handle(null, vs).then(hr => {
        //     assert(hr.projectsReviewed === 1);
        //     assert(hr.projectReviews.length === 1);
        //     assert.deepEqual(hr.versions, ["2.5"]);
        //     done();
        // }).catch(done);
    });

});
