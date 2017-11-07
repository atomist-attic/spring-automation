import { ProgressLog } from "../commands/generator/build/DeploymentChain";

const Convert = require('ansi-to-html');
const convert = new Convert();

export class ColorEscapingProgressLog implements ProgressLog {

    public constructor(private log: ProgressLog) {}

    public write(what: string): void {
        this.log.write(convert.toHtml(what));
    }
}