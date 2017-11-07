import "mocha";
import { FromInitializr } from "./addStarterEditorTest";
import { identification } from "./pomParser";

import * as assert from "power-assert";

describe("POM parsing", () => {

    it("parses initializr project", done => {
        const content = FromInitializr;
        identification(content)
            .then(parsed => {
                assert(parsed.group === "com.example");
                assert(parsed.artifact === "demo");
                assert(parsed.version === "0.0.1-SNAPSHOT");
                done();
            }).catch(done);
    });

});
