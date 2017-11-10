import "mocha";
import * as assert from "power-assert";
import { ProgressLog } from "../../src/commands/generator/build/DeploymentChain";
import { ColorEscapingProgressLog } from "../../src/web/ColorEscapingProgressLog";
import { ColorEscapeSuppressingProgressLog } from "../../src/web/ColorEscapeSuppressingProgressLog";

class SavingLog implements ProgressLog {

    public logged: string[] = [];

    public write(what: string): void {
        this.logged.push(what);
    }
}

describe("ColorEscapeSuppressingProgressLog", () => {

    it("should not change no color", () => {
        const noColor = "this is just text without color escapes";
        const l = new SavingLog();
        const cl = new ColorEscapeSuppressingProgressLog(l);
        cl.write(noColor);
        assert.deepEqual(l.logged, [noColor]);
    });

    it.skip("should change color escape", () => {
        const noColor = " [1m[31m----->[0m[22m [1m[34mJava Buildpack[0m[22m ";
        const l = new SavingLog();
        const cl = new ColorEscapeSuppressingProgressLog(l);
        cl.write(noColor);
        assert.deepEqual(l.logged, [" ----->   Java Buildpack  "]);
    });

});
