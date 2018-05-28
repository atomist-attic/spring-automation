/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { SimpleRepoId } from "@atomist/automation-client/operations/common/RepoId";

import { HandlerContext } from "@atomist/automation-client";
import { fromListRepoFinder, fromListRepoLoader } from "@atomist/automation-client/operations/common/fromProjectList";
import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import { MessageClient } from "@atomist/automation-client/spi/message/MessageClient";
import * as assert from "power-assert";
import {
    versionSpreadReviewerCommand,
    VersionSpreadReviewerParameters,
} from "../../../../src/commands/reviewer/maven/VersionSpreadReviewer";
import { NonSpringPom } from "./Poms";

describe("VersionSpreadReviewer", () => {

    // TODO need to re-enable these tests...probably need a different functional approach

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

});
