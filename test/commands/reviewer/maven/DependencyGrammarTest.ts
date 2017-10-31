import "mocha";

import * as assert from "power-assert";

import { dependencyOfGrammar } from "../../../../src/grammars/mavenGrammars";
import { springBootPom } from "./Poms";

describe("dependency grammar", () => {

    it("finds no match", () => {
        const matches = dependencyOfGrammar("xxxcommons-io", "xxxcommons-io")
            .findMatches(springBootPom("1.3.1"));
        assert(matches.length === 0);
    });

    it("finds a match", () => {
        const matches = dependencyOfGrammar("commons-io", "commons-io")
            .findMatches(springBootPom("1.3.1"));
        assert(matches.length === 1);
        assert(matches[0].gav.version === "2.5");
    });
});
