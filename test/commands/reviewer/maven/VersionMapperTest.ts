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

import { consolidate, VersionMapper } from "../../../../src/commands/reviewer/maven/VersionMapper";
import { VersionedArtifact } from "../../../../src/grammars/VersionedArtifact";

import { RepoFinder } from "@atomist/automation-client/operations/common/repoFinder";
import { RepoId, SimpleRepoId } from "@atomist/automation-client/operations/common/RepoId";
import { RepoLoader } from "@atomist/automation-client/operations/common/repoLoader";

import { fromListRepoFinder, fromListRepoLoader } from "@atomist/automation-client/operations/common/fromProjectList";
import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import { Project } from "@atomist/automation-client/project/Project";
import * as assert from "power-assert";
import { NonSpringPom, springBootPom } from "./Poms";

class TestVersionMapper extends VersionMapper {

    private readonly rf: RepoFinder;
    private readonly rl: RepoLoader;

    constructor(public readonly repos: Project[]) {
        super();
        // Prevent querying of github
        this.rf = fromListRepoFinder(repos);
        this.rl = fromListRepoLoader(repos);
    }

    protected repoFinder() {
        return this.rf;
    }

    protected repoLoader(): RepoLoader {
        return this.rl;
    }
}

describe("VersionMapper", () => {

    it("no comments for no matching artifact", done => {
        const project = InMemoryProject.of({ path: "pom.xml", content: NonSpringPom });
        const repoId: RepoId = new SimpleRepoId("a", "b");
        (project as any).id = repoId;

        const vs = new TestVersionMapper([project]);

        vs.handle(null).then(hr => {
            assert(hr.code === 0);
            assert(!!(hr as any).map);
            done();
        }).catch(done);
    });

    it("finds version", done => {
        const project = InMemoryProject.of({ path: "pom.xml", content: springBootPom("1.3.0") });
        const repoId: RepoId = new SimpleRepoId("a", "b");
        (project as any).id = repoId;

        const vs = new TestVersionMapper([project]);

        vs.handle(null).then(hr => {
            const m = (hr as any).map;
            assert(m);
            assert(!!m["com.krakow"]);
            assert.deepEqual(m["com.krakow"].lib1, ["0.1.1"]);
            done();
        }).catch(done);
    });

});

describe("artifact consolidate", () => {

    it("consolidates empty", () => {
        const arrs: VersionedArtifact[][] = [];
        const consolidated = consolidate(arrs);
        assert.deepEqual(consolidated, {}, JSON.stringify(consolidated));
    });

    it("consolidates single", () => {
        const arrs: VersionedArtifact[][] = [[{ group: "g", artifact: "a", version: "1.0" }]];
        const consolidated = consolidate(arrs);
        assert.deepEqual(consolidated,
            {
                g: {
                    a: ["1.0"],
                },
            }, JSON.stringify(consolidated));
    });

});
