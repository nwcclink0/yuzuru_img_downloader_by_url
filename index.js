var Scraper = require('image-scraper');
const kMinimalFileSize = 20 * 1024; //20k
const kUrlList = "./urllist.txt";
const kSavePath = "saveimg";
const kWaitForWriteTime = 2000;

function  startDownloadImg() {
    checkSaveImgFolderExist();
    readDownloadList();
}

function checkSaveImgFolderExist() {
    var fs = require('fs');
    var dir = kSavePath;
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
}

function readDownloadList() {
    const readline = require('readline');
    const fs = require("fs");
    const readInterface = readline.createInterface({
        input: fs.createReadStream(kUrlList),
        output: process.stdout,
        console:true
    });
    var times = 1;
    readInterface.on("line", function (line) {
        setTimeout(function () {
            scrapeImage(line);
        }, kWaitForWriteTime * times);
        times++;
    })
}

function checkFileExist(filename) {
    const fs = require('fs');
    try {
        if (fs.existsSync(filename)) {
            return true;
        }
        return false;
    } catch(err) {
        console.error(err);
        return  false;
    }
}

function removeFile(filename) {
    const fs = require('fs');
    if (checkFileExist(filename)) {
        //file exists
        try {
            fs.unlinkSync(filename)
            //file removed
        } catch(err) {
            console.error(err)
        }
    }
}

// function checkExistSameSize(fileSizeInByte, fileName) {
//     const readline = require('readline');
//     const fs = require("fs");
//     const readInterface = readline.createInterface({
//         input: fs.createReadStream("./fileSizeList.txt"),
//         output: process.stdout,
//         console:true
//     });
//     let localFileName = fileName;
//     let localFileSizeInByte = fileSizeInByte;
//     var found = false;
//     readInterface.on("line", function (line) {
//         if (found) {
//             return;
//         }
//         console.log(" read size:" + line + "; file size: " + localFileSizeInByte + "; file name: " + localFileName);
//         if (line == fileSizeInByte) {
//             removeFile(fileName);
//             found = true;
//         } else {
//             writeFileSizeToFile(fileSizeInByte);
//         }
//     })
// }

function getFilesizeInBytes(filename) {
    const fs = require("fs"); //Load the filesystem module
    const isWin = process.platform === "win32";
    var path = process.cwd() + "/";
    if (isWin) {
        path = process.cwd() + "\\";
    }
    const stats = fs.statSync(path + filename);
    const fileSizeInBytes = stats.size;
    // if (fileSizeInBytes < 20 * 1024 ) {
    if (fileSizeInBytes < kMinimalFileSize) {
        removeFile(filename);
    } //20k
    // checkExistSameSize(fileSizeInBytes.toString(),path + filename);
    return fileSizeInBytes;
}

// function writeFileSizeToFile ( text )
// {
//     const fs = require("fs"); //Load the filesystem module
//     const path = process.cwd() + "\\" + "fileSizeList.txt";
//     fs.open(path, 'a', 666, function( e, id ) {
//         fs.write( id, text + "\r\n", null, 'utf8', function(){
//             fs.close(id, function(){
//                 console.log('file is updated');
//             });
//         });
//     });
// }

function scrapeImage(url) {
    var scraper = new Scraper(url);

    scraper.scrape(function(image) {
        if (image.extension.search(".jpg")>= 0){
            // console.log("original extension :" + image.extension);
            image.extension = ".jpg";
            const isWin = process.platform === "win32";
            var fileNamePrefix = kSavePath + "/" + Date.now();
            if (isWin) {
                fileNamePrefix = kSavePath + "\\" + Date.now();
            }
            
            let filename = fileNamePrefix + image.name + image.extension;
            console.log("file name: " + filename);
            image.saveTo = fileNamePrefix;
            image.save();
            setTimeout(function () {
                if (checkFileExist(filename)) {
                    let fileSize = getFilesizeInBytes(filename);
                    // console.log("file size: " + fileSize);
                }
            }, kWaitForWriteTime);

        }
    });
}

startDownloadImg();
// scrapeImage("https://mainichi.jp/graphs/20191204/hpj/00m/050/001000g/1") ;
//
// var Crawler = require("simplecrawler");
// var moment = require("moment");
// var cheerio = require("cheerio");
//
// var crawler = new Crawler("https://mainichi.jp/graphs/20191204/hpj/00m/050/001000g/1");
//
// function log() {
//     var time = moment().format("HH:mm:ss");
//     var args = Array.from(arguments);
//
//     args.unshift(time);
//     console.log.apply(console, args);
// }
//
// crawler.downloadUnsupported = false;
// crawler.decodeResponses = true;
//
// crawler.addFetchCondition(function(queueItem) {
//     return !queueItem.path.match(/\.(zip|jpe?g|)$/i);
// });
//
// crawler.on("crawlstart", function() {
//     log("crawlstart");
// });
//
// var fetched = [];
// crawler.on("fetchcomplete", function(queueItem, responseBuffer) {
//     log("fetchcomplete", queueItem.url);
//     if (queueItem.url.search("https://mainichi.jp/graphs/20191204/hpj/00m/050/001000g") >= 0) {
//         if(fetched.indexOf(queueItem.url) > -1) {
//             return;
//         }
//         fetched.push(queueItem.url);
//         scrapeImage(queueItem.url);
//     }
// });
//
// crawler.on("fetch404", function(queueItem, response) {
//     log("fetch404", queueItem.url, response.statusCode);
// });
//
// crawler.on("fetcherror", function(queueItem, response) {
//     log("fetcherror", queueItem.url, response.statusCode);
// });
//
// crawler.on("complete", function() {
//     log("complete");
// });
//
// // crawler.maxDepth =1;
// crawler.start();
