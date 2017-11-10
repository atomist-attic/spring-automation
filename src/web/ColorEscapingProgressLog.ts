import { ProgressLog } from "../commands/generator/build/DeploymentChain";

const Convert = require("ansi-to-html");
const convert = new Convert();

// TODO doesn't seem to work - does convert to HTML but it doesn't render as the page load
export class ColorEscapingProgressLog implements ProgressLog {

    public constructor(private log: ProgressLog) {}

    public write(what: string): void {
        this.log.write(convert.toHtml(what));
    }
}
