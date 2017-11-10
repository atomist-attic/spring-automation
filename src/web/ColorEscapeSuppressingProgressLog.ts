import { ProgressLog } from "../commands/generator/build/DeploymentChain";

const stripAnsi = require("strip-ansi");

/**
 * Zap color escapes of format [1m[31m
 */
export class ColorEscapeSuppressingProgressLog implements ProgressLog {

    public constructor(private log: ProgressLog) {}

    public write(what: string): void {
        this.log.write(stripAnsi(what));
    }
}
