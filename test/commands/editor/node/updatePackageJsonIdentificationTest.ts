import "mocha";

import { SimpleProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import * as assert from "power-assert";
import { updatePackageJsonIdentification } from "../../../../src/commands/editor/node/updatePackageJsonIdentification";

describe("updatePackageJsonIdentification", () => {

    it("doesn't edit empty project", done => {
        const p = new InMemoryProject();
        const sim: SimpleProjectEditor = updatePackageJsonIdentification("x", "y", "v", "a");
        sim(p, null, null)
            .then(edited => {
                assert(!!edited);
                assert(edited === p);
                done();
            }).catch(done);
    });

    it("changes name", done => {
        const p = InMemoryProject.of({path: "package.json", content: SimplePackageJson });
        const name = "thing1";
        updatePackageJsonIdentification(name, name, "0.0.0", "a")(p)
            .then(() => {
                const content = p.findFileSync("package.json").getContentSync();
                console.log(content);
                assert(content.includes(name));
                const parsed = JSON.parse(content);
                assert(parsed.name === name);
                done();
            }).catch(done);
    });

    it("changes version", done => {
        const p = InMemoryProject.of({path: "package.json", content: SimplePackageJson });
        const version = "0.1.0";
        updatePackageJsonIdentification("somename", "", version, "a")(p)
            .then(() => {
                const content = p.findFileSync("package.json").getContentSync();
                console.log(content);
                assert(content.includes(version));
                const parsed = JSON.parse(content);
                assert(parsed.version === version);
                done();
            }).catch(done);
    });

    it("changes description", done => {
        const p = InMemoryProject.of({path: "package.json", content: SimplePackageJson });
        const version = "0.1.0";
        const description = "whatever you say";
        updatePackageJsonIdentification("somename", description, version, "a")(p)
            .then(() => {
                const content = p.findFileSync("package.json").getContentSync();
                console.log(content);
                assert(content.includes(description));
                const parsed = JSON.parse(content);
                assert(parsed.description === description);
                done();
            }).catch(done);
    });

    it("changes author", done => {
        const p = InMemoryProject.of({path: "package.json", content: SimplePackageJson });
        const version = "0.1.0";
        const author = "vonnegut";
        updatePackageJsonIdentification("somename", "descr", version, author)(p)
            .then(() => {
                const content = p.findFileSync("package.json").getContentSync();
                console.log(content);
                assert(content.includes(author));
                const parsed = JSON.parse(content);
                assert(parsed.author === author);
                done();
            }).catch(done);
    });

});

export const SimplePackageJson = `{
  "name": "heros",
  "description": "The tour of heros",
  "version": "1.0.0",
  "private": true,
  "author": "Brian Love",
  "scripts": {
    "dev": "NODE_ENV=development nodemon ./bin/www",
    "grunt": "grunt",
    "start": "node ./bin/www"
  },
  "dependencies": {
    "body-parser": "^1.18.2",
    "cookie-parser": "^1.4.3",
    "errorhandler": "^1.5.0",
    "express": "^4.16.2",
    "morgan": "^1.9.0",
    "pug": "^2.0.0-rc.4"
  },
  "devDependencies": {
    "@types/body-parser": "1.16.8",
    "@types/cookie-parser": "^1.4.1",
    "@types/errorhandler": "0.0.32",
    "@types/method-override": "0.0.31",
    "@types/morgan": "^1.7.35",
    "grunt": "^1.0.1",
    "grunt-contrib-copy": "^1.0.0",
    "grunt-contrib-watch": "^1.0.0",
    "grunt-ts": "^6.0.0-beta.17",
    "nodemon": "^1.12.1",
    "typescript": "^2.6.1"
  }
}`;
