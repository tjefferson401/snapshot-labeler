// script.js
import { PyodideApi, setPyodide } from "./PyodideHelpers/Runner.js";

document.addEventListener('DOMContentLoaded', async () => {
    await setPyodide();
    window.pyodideClient = new PyodideApi();

});



/**
 * @Ali Changes need to be made here
 * Cracked test 
 */
document.getElementById('uploadButton').addEventListener('click', function() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    
    if (!file) {
        console.log('No file selected.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(event) {
        const csvContent = event.target.result;
        console.log('CSV Content:', csvContent);

        const rows = csvContent.split('\n').map(row => row.split(','));
        console.log('CSV Parsed:', rows);
        console.log(rows.length)
        console.time('test')
        // THIS CODE SHOULD BE FASTER
        const promises = [];
        const results = [];
        for(let i = 0; i < 100; i++) {
            // handle rows to access code
            const code = `
def main():
    print('Hello, World!')

if __name__ == '__main__':
    main()
`
            results.push(await window.pyodideClient.crackedTest(code, [], {name: "test.py"}))

        }
        // END OF FASTER CODE
        console.timeEnd('test')
        console.log(results)
    };
    reader.onerror = function(event) {
        console.error('File could not be read! Code ' + event.target.error.code);
    };

    reader.readAsText(file);
});

