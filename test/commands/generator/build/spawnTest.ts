
import { spawn } from "child_process";
import "mocha";
import * as os from "os";

describe("spawn cf client", () => {

    it.skip("should spawn", done => {
        const cp = spawn(
            "cf",
            [
                "push",
                "pong-matcher-spring",
                "-p",
                "target/pong-matcher-spring-1.0.0.BUILD-SNAPSHOT.jar",
                "--random-route",
            ],
            {
                cwd: "/Users/rodjohnson/.atomist-working/cloudfoundry-samples/pong_matcher_spring",
            });

        // cp.stdout.pipe(process.stdout);
        cp.stdout.on("data", data => console.log("Data is " + data));
        cp.on("error", err => {
            cp.stderr.pipe(process.stderr);
            done(err);
        });
        cp.on("close", e => {
            console.log("close");
            done();
        });
        cp.on("exit", e => {
            console.log("EXIT");
        });
    });

});
