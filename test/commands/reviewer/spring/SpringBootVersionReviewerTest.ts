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

import { ConsoleMessageClient } from "@atomist/automation-client/internal/message/ConsoleMessageClient";
import { RepoId, SimpleRepoId } from "@atomist/automation-client/operations/common/RepoId";
import { ProjectReviewer } from "@atomist/automation-client/operations/review/projectReviewer";
import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import * as assert from "power-assert";
import {
    springBootVersionReviewer,
    SpringBootVersionReviewerParameters,
} from "../../../../src/commands/reviewer/spring/SpringBootVersionReviewer";
import { NonSpringPom, springBootPom } from "../maven/Poms";

describe("SpringBootVersionReviewer", () => {

    function reviewer(): ProjectReviewer<any> {
        return springBootVersionReviewer;
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
        reviewer()(proj, ctx, new SpringBootVersionReviewerParameters())
            .then(r => {
                const rev = r as any;
                assert(rev.repoId.owner === id.owner);
                assert(rev.repoId.repo === id.repo);
                assert(rev.comments.length === 1);
                assert(rev.comments[0].detail.includes(new SpringBootVersionReviewerParameters().desiredBootVersion));
                assert(rev.desiredVersion === new SpringBootVersionReviewerParameters().desiredBootVersion);
                assert(rev.version === v, rev.version);
                done();
            }).catch(done);
    });

});
