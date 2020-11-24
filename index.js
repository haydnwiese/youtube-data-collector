require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');

const VIDEO_CATEGORIES = {
    howtoStyle: 26,
    gaming: 20
}
const MAX_RESULTS = 50;
const BEGIN_DATE = '2018-01-01T00:00:00Z';
const END_DATE = '2018-12-31T00:00:00Z';
const BASE_URL = 'https://youtube.googleapis.com/youtube/v3';
const TOTAL_RESULTS_MAX = 10000;

let results = new Object();
let callNum = 0;
// fetchVideoDetails('rkux5h0PeXo');
collectData();

async function collectData() {
    let pageToken;

    while (Object.keys(results).length < TOTAL_RESULTS_MAX) {
        try {    
            pageToken = await fetchCategoryResults(pageToken, VIDEO_CATEGORIES.gaming);
            console.log(pageToken)
            console.log(Object.keys(results).length)
        } catch (err) {
            console.log(err);
            break;
        }
    }

    fs.writeFile('myjsonfile.json', JSON.stringify(results, null, "\t") , 'utf8');
}

async function fetchCategoryResults(pageToken, categoryId) {
    if (!pageToken) {
        pageToken = '';
    }

    const url = `${BASE_URL}/search?part=snippet&type=video&videoCategoryId=${categoryId}&pageToken=${pageToken}&maxResults=${MAX_RESULTS}&publishedBefore=${END_DATE}&publishedAfter=${BEGIN_DATE}&key=${process.env.ACCESS_TOKEN}`
    const response = await fetch(url);
    const json = await response.json();

    if (json.error && json.error.code != 200) {
        throw new Error('Search failed');
    }
        // .then(res => res.json())
        // .then(json => fs.writeFile('myjsonfile.json', JSON.stringify(json, null, "\t") , 'utf8'))
        // .then(json => console.log(json))
    callNum++;
    if (json && json.items) {
        const videoIdParameter = generateVideoIdParameter(json.items);
        await fetchVideoDetails(videoIdParameter);
    }

    return json.nextPageToken;
}

/**
 * 
 * @param {Object[]} items 
 * @returns {string} videoIds
 */
function generateVideoIdParameter(items) {
    let videoIds = [];
    items.forEach((item) => {
        videoIds.push(item.id.videoId)
    });
    return videoIds.toString();
}

async function fetchVideoDetails(videoIdParam) {
    const url = `${BASE_URL}/videos?part=snippet%2Cstatistics&id=${videoIdParam}&key=${process.env.ACCESS_TOKEN}`;
    const response = await fetch(url);
    const json = await response.json();

    if (!json.items) return;

    json.items.forEach(item => {
        const {snippet, statistics} = item;
        // console.log(item.id);
        if (!results[item.id] 
            && Object.keys(results).length < TOTAL_RESULTS_MAX) {
            results[item.id] = {
                videoId: item.id,
                title: snippet.title,
                publishedAt: snippet.publishedAt,
                viewCount: statistics.viewCount,
                likeCount: statistics.likeCount,
                dislikeCount: statistics.dislikeCount
            };
        }
    })
}





