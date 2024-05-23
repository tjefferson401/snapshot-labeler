// script.js
import { PyodideApi, setPyodide } from "./PyodideHelpers/Runner.js";
import { UNIT_TESTS } from "./constants.js";

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
    
    if (!file) {
        console.log('No file selected.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(event) {
        // Get JSON file content
        const fileContent = event.target.result;
        const jsonObject = JSON.parse(fileContent);
    
        console.log(jsonObject);
    
        // The rest of your code can go here...
        // For example, timing a series of asynchronous operations:
        console.time('test');
        for (let i = 0; i < jsonObject.length; i++) {
            const snapshots = jsonObject[i];
            let results = [];
            for(let unitTest of UNIT_TESTS[snapshots.assnId].unitTests) {
                const pre = unitTest.pre
                if (karel.includes(snapshots.assnId)) {
                    pyodideClient.setKarelInfo(pre, ()=>{}, 0);
                    results.push(await window.pyodideClient.crackedTest(snapshots.code, [], {name: "test.py"}));

                }else {
                    results.push(await window.pyodideClient.crackedTest(snapshots.code, pre, {name: "test.py"}));
                }
            }
            jsonObject[i].results = results;
        }

    
        console.timeEnd('test');
        // spit out json file that is same as file content, but with results added
        
        const blob = new Blob([JSON.stringify(jsonObject)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'output.json';
        a.click();
        URL.revokeObjectURL(url);
        

    };
    reader.onerror = function(event) {
        console.error('File could not be read! Code ' + event.target.error.code);
    };

    reader.readAsText(file);
});

