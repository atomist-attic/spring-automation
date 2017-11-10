
const WorkingImage = "https://cdn.dribbble.com/users/59947/screenshots/3492457/busy-dribbble.gif";

const checkYes = "https://media.istockphoto.com/photos/check-mark-picture-id179342378?k=6&m=179342378&s=612x612&w=0&h=sFdAqOZ3cmnRm6_3sj1BO5MNumn4gkHVMC1AdHISdL0=";
const checkNo = "https://thumbs.dreamstime.com/t/check-icon-checkmark-checkbox-no-voting-symbol-flat-vector-illustration-79862389.jpg";

function deployinate(owner, repo) {
    const explanation = document.getElementById("explanation");
    const outputPane = document.getElementById('output_pane');
    explanation.hidden = true;
    outputPane.hidden = false;

    const output = document.getElementById('deployment');
    const statusImage = document.getElementById("image_placeholder");

    const imageHolder = document.getElementById("image_holder");

    statusImage.src = WorkingImage;

    output.onload = function () {
        const innerDoc = (output.contentDocument) ? output.contentDocument : output.contentWindow.document;
        const returnedString = innerDoc.documentElement.outerHTML;

        //console.log(returnedString);
        const failed = returnedString.match(/Build failure: Failure/);
        if (!failed) {
            const url = computeUrl(returnedString);

            imageHolder.innerHTML = `<img src="${checkYes}"
                    width="100" height="100"
/>
<p></p>
<p><a href="https://${url}/person/Juergen">Running app</a></p>
<p><a href="https://console.run.pivotal.io">Pivotal Console</a></p>`;
        } else {
            imageHolder.innerHTML = `<img src="${checkNo}"
                    width="100" height="100"
/>`;
        }
    };
    output.src = `/doDeploy/pcf/github/${owner}/${repo}`;
//         output.contentWindow.document.body.style.backgroundColor="blue";
//         output.contentDocument.body.style.fontFamily = "Courier";
}

function computeUrl(s) {
    return /urls:\s+([A-Za-z0-9.\-]+)/.exec(s)[1];
}