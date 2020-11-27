const fs = require('fs');
const util = require('util');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// fs.readFile('myjsonfile.json', function (error, content) {
//     var data = JSON.parse(content);
//     console.log(Object.keys(data).length);
// });

const readFileContent = util.promisify(fs.readFile);

generateCSV('lifestyle_final');

async function readFile() {
    let buffer = await readFileContent('results_old.json');
    const data = JSON.parse(buffer.toString());
    
    const length = Object.keys(data).length;
    Object.entries(data).forEach(([key], index) => {
        if (index < length - 500) {
            delete data[key];
        }
    });
    console.log(Object.keys(data).length);
    
    fs.writeFileSync('results/test.json', JSON.stringify(data, null, "\t") , 'utf8');
}

async function calculateRatio() {
    let buffer = await readFileContent('results/lifestyle_trimmed.json');
    const data = JSON.parse(buffer.toString());

    for (const [key] of Object.entries(data)) {
        const ratio = data[key].likeCount / data[key].dislikeCount;
        const rounded = Math.round((ratio + Number.EPSILON) * 100) / 100;
        data[key].likeDislikeRatio = rounded;
    }
    
    fs.writeFileSync('results/lifestyle_final.json', JSON.stringify(data, null, "\t") , 'utf8');
}

function createArray(data) {
    let resultsArray = [];
    for (const [key, value] of Object.entries(data)) {
        resultsArray.push(value);
    }
    return resultsArray;
}

async function generateCSV(filename) {
    let buffer = await readFileContent(`results/${filename}.json`);
    const data = JSON.parse(buffer.toString());

    const dataArray = createArray(data);

    const csvWriter = createCsvWriter({
        path: 'results/lifestyle.csv',
        header: [
          {id: 'videoId', title: 'Video ID'},
          {id: 'title', title: 'Video Title'},
          {id: 'publishedAt', title: 'Publish Date'},
          {id: 'viewCount', title: 'View Count'},
          {id: 'likeCount', title: 'Like Count'},
          {id: 'dislikeCount', title: 'Dislike Count'},
          {id: 'likeDislikeRatio', title: 'Like-dislike Ratio'},
        ]
      });

    csvWriter.writeRecords(dataArray);
}