// script.js
import { PyodideApi, setPyodide } from "./PyodideHelpers/Runner.js";
import { UNIT_TESTS } from "./constants.js";
// import { areWorldsEqual } from "./util.js";

document.addEventListener('DOMContentLoaded', async () => {
    await setPyodide();
    window.pyodideClient = new PyodideApi();

});

const karel = ["stonemason", "fillkarel"]


/**
 * @Ali Changes need to be made here
 * Cracked test
 */
document.getElementById('uploadButton').addEventListener('click', function() {
    const fileInput = document.getElementById('jsonFileInput');
    const file = fileInput.files[0];
    console.log(file)
    if (!file) {
        console.log('No file selected.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(event) {
        // Get JSON file content
        const fileContent = event.target.result;
        // filecontent is jsonl so we need to split it by new line
        const jsonObject = fileContent.split('\n').filter(x => x).map((x) => {
            // console.log(x);
            return JSON.parse(x);
        });

        // console.log(jsonObject);

        // The rest of your code can go here...
        // For example, timing a series of asynchronous operations:
        console.time('test');
        for (let i = 0; i < jsonObject.length; i++) {
            const snapshots = jsonObject[i];
            // console.log(snapshots.code);
            if ((i+1) % 5 === 0) {
                document.getElementById('progress').innerText = `Progress ${i + 1} / ${jsonObject.length}`;
            }
            let results = [];
            for(let unitTest of UNIT_TESTS[snapshots.assnId].unitTests) {
                const pre = unitTest.pre
                if (karel.includes(snapshots.assnId)) {
                    pyodideClient.setKarelInfo(pre, ()=>{}, 0);
                    const res = await window.pyodideClient.crackedTest(snapshots.code, pre, {name: "test.py"});
                    const didError = (res.error || []).length > 0;
                    const didPass = !didError && true;
                    // console.log(res);
                    // console.log(didPass);
                    // return
                    results.push({
                        didPass,
                        didError,
                        errors: res.error,
                        output: res.world,
                    });

                }else {
                    const res = await window.pyodideClient.crackedTest(snapshots.code, pre, {name: "test.py"})
                    const didError = (res.error || []).length > 0;
                    const outputTrimmed = res.output.map(x => x.trim());
                    const postTrimmed = unitTest.post.map(x => x.trim());
                    const didPass = !didError && JSON.stringify(outputTrimmed) === JSON.stringify(postTrimmed);
                    results.push({
                        didPass,
                        didError,
                        errors: res.error,
                        output: res.output,
                    });
                }
            }
            jsonObject[i].run_results = results;
        }


        console.timeEnd('test');
        // spit out json file that is same as file content, but with results added

        const to_save_jsonl = jsonObject.map((x) => JSON.stringify(x)).join('\n');
        const blob = new Blob([to_save_jsonl], {type: 'application/text'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `output_${jsonObject[0].assnId}.jsonl`;
        a.click();
        URL.revokeObjectURL(url);


    };
    reader.onerror = function(event) {
        console.error('File could not be read! Code ' + event.target.error.code);
    };

    reader.readAsText(file);
});