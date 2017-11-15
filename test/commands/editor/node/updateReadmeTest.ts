import "mocha";

import { SimpleProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import * as assert from "power-assert";
import { updatePackageJsonIdentification } from "../../../../src/commands/editor/node/updatePackageJsonIdentification";
import { updateReadme } from "../../../../src/commands/editor/node/updateReadme";

describe("updateReadme", () => {

    it("doesn't edit empty project", done => {
        const p = new InMemoryProject();
        const sim: SimpleProjectEditor = updateReadme("x", "y");
        sim(p, null, null)
            .then(edited => {
                assert(!!edited);
                assert(edited === p);
                done();
            }).catch(done);
    });

    it("changes name", done => {
        const p = InMemoryProject.of({path: "README.md", content: SimpleReadme });
        const name = "thing1";
        const description = "foo";
        updateReadme(name, description)(p)
            .then(() => {
                const content = p.findFileSync("README.md").getContentSync();
                console.log(content);
                assert(content.includes(name));
                done();
            }).catch(done);
    });

    it("adds description", done => {
        const p = InMemoryProject.of({path: "README.md", content: SimpleReadme });
        const description = "whatever you say";
        updateReadme("somename", description)(p)
            .then(() => {
                const content = p.findFileSync("README.md").getContentSync();
                console.log(content);
                assert(content.includes(description));
                done();
            }).catch(done);
    });

});

export const SimpleReadme = `# TypeScript 2 + Express + Node.js

This is a repository to go with my article on creating an Express web application using TypeScript 2.

## Install

Install the node packages via:

\`$ npm install\`

And then run the grunt task to compile the TypeScript:

\`$ npm run grunt\`

## Starting

To start the server run:

\`$ npm start\``;
