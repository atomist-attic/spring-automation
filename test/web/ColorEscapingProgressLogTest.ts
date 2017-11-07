import "mocha";
import * as assert from "power-assert";
import { ProgressLog } from "../../src/commands/generator/build/DeploymentChain";
import { ColorEscapingProgressLog } from "../../src/web/ColorEscapingProgressLog";

class SavingLog implements ProgressLog {

    public logged: string[] = [];

    public write(what: string): void {
        this.logged.push(what);
    }
}

describe("ColorEscapingProgressLog", () => {

    it("should not change no color", () => {
        const noColor = "this is just text without color escapes";
        const l = new SavingLog();
        const cl = new ColorEscapingProgressLog(l);
        cl.write(noColor);
        assert.deepEqual(l.logged, [noColor]);
    });

    it("should change color escape", () => {
        const noColor = "[1m[31m----->[0m[22m [1m[34mJava Buildpack[0m[22m ";
        const l = new SavingLog();
        const cl = new ColorEscapingProgressLog(l);
        cl.write(noColor);
        assert.deepEqual(l.logged, [noColor]);
    });

});
