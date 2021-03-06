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

import { HandlerContext } from "@atomist/automation-client";
import { fromListRepoFinder, fromListRepoLoader } from "@atomist/automation-client/operations/common/fromProjectList";
import { SimpleRepoId } from "@atomist/automation-client/operations/common/RepoId";
import { CustomExecutionEditMode } from "@atomist/automation-client/operations/edit/editModes";
import { EditResult, ProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import { Project } from "@atomist/automation-client/project/Project";
import * as assert from "power-assert";
import {
    springBootVersionUpgrade,
} from "../../../../src/commands/editor/spring/SpringBootVersionUpgrade";
import { UnleashPhilParameters } from "../../../../src/commands/editor/spring/unleashPhil";
import { NonSpringPom, springBootPom } from "../../reviewer/maven/Poms";

describe("springBootVersionUpgrade", () => {

    it("does nothing to non Spring project", done => {
        const proj = InMemoryProject.from(new SimpleRepoId("foo", "bar"), {path: "pom.xml", content: NonSpringPom});
        const rf = fromListRepoFinder([proj]);
        (springBootVersionUpgrade(rf) as any).handle(null, new UnleashPhilParameters())
            .then(() => {
                done();
            }).catch(done);
    });

    it("does nothing when project is already up to date", done => {
        const proj = InMemoryProject.from(new SimpleRepoId("a", "b"), {
            path: "pom.xml",
            content: springBootPom(new UnleashPhilParameters().desiredBootVersion),
        });
        const rf = fromListRepoFinder([proj]);
        (springBootVersionUpgrade(rf) as any).handle(null, new UnleashPhilParameters())
            .then(() => {
                done();
            }).catch(done);
    });

    it("upgrades old Spring project", done => {
        let verified = false;
        const v = "1.3.0";
        const proj = InMemoryProject.from(new SimpleRepoId("x", "y"), {path: "pom.xml", content: springBootPom(v)});
        const rf = fromListRepoFinder([proj]);
        const params = new UnleashPhilParameters();
        params.targets.repo = ".*";
        (springBootVersionUpgrade(rf, p => fromListRepoLoader([proj]),
            new VerifyEditMode(p => {
                const updated = p.findFileSync("pom.xml");
                assert(!updated.getContentSync().includes(v));
                assert(updated.getContentSync().includes(new UnleashPhilParameters().desiredBootVersion));
                verified = true;
            })) as any).handle(null, params)
            .then(() => {
                assert(verified, "Not verified");
                done();
            }).catch(done);
    });

    it("upgrades nested old Spring project: One down style", done => {
        let verified = false;
        const v = "1.3.0";
        const proj = InMemoryProject.from(new SimpleRepoId("x", "y"),
            {path: "proj1/pom.xml", content: springBootPom(v)},
            {path: "proj2/pom.xml", content: springBootPom(v)},
        );
        const rf = fromListRepoFinder([proj]);
        const params = new UnleashPhilParameters();
        params.targets.repo = ".*";
        (springBootVersionUpgrade(rf, p => fromListRepoLoader([proj]),
            new VerifyEditMode(p => {
                const updated1 = p.findFileSync("proj1/pom.xml");
                assert(!updated1.getContentSync().includes(v));
                assert(updated1.getContentSync().includes(new UnleashPhilParameters().desiredBootVersion));
                const updated2 = p.findFileSync("proj2/pom.xml");
                assert(!updated2.getContentSync().includes(v));
                assert(updated2.getContentSync().includes(new UnleashPhilParameters().desiredBootVersion));
                verified = true;
            })) as any).handle(null, params)
            .then(() => {
                assert(verified, "Not verified");
                done();
            }).catch(done);
    });

});

class VerifyEditMode implements CustomExecutionEditMode {

    public message = "foo";

    constructor(private readonly assertions: (p: Project) => void) {

    }

    public edit<P>(p: Project, action: ProjectEditor<P>, context: HandlerContext, parameters: P): Promise<EditResult> {
        return action(p, context, parameters)
            .then(er => {
                this.assertions(p);
                return er;
            });
    }
}
