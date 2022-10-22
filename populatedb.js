#! /usr/bin/env node
const fs = require('fs');
const path = require('path');
const service_controller = require('./controllers/serviceController');

console.log('This script populates the rooms to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async');
var Room = require('./models/room');
var Cleaner = require('./models/cleaner');

var mongoose = require('mongoose');
const service = require('./models/service');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var roomnumbersOnPages = [
    [2014, 2230],
    [3000, 3056],
    [3060, 3120],
    [3122, 3180],
    [3182, 3244],
    [4000, 4058],
    [4060, 4120],
    [4122, 4180],
    [4182, 4245],
];

var nonexistentRooms = [
1000,
2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2015,2017,2019,2021,2023,2025,
2027,2029,2031,2033,2035,2036,2037,2038,2039,2040,2041,2042,2043,2044,2045,2046,2047,2048,2049,2050,
2051,2052,2053,2054,2055,2056,2057,2058,2059,2060,2061,2062,2063,2064,2065,2066,2067,2068,2069,2070,
2071,2072,2073,2074,2075,2076,2077,2078,2079,2080,2081,2082,2083,2084,2085,2086,2087,2088,2089,2090,
2091,2092,2093,2094,2095,2096,2097,2098,2099,2100,2101,2102,2103,2104,2105,2106,2107,2108,2109,2110,
2111,2112,2113,2114,2115,2116,2117,2118,2119,2120,2121,2122,2123,2124,2125,2126,2127,2128,2129,2130,
2131,2132,2133,2134,2135,2136,2137,2138,2139,2140,2141,2142,2143,2144,2145,2146,2147,2148,2149,2150,
2151,2152,2153,2154,2155,2156,2157,2158,2159,2160,2161,2162,2163,2164,2165,2166,2167,2168,2169,2170,
2171,2172,2173,2174,2175,2176,2177,2178,2179,2180,2181,2182,2183,2184,2185,2186,2187,2188,2189,2190,
2191,2192,2193,2194,2195,2196,2197,2198,2199,2200,2201,2202,2203,2204,2205,2206,2207,2208,2209,2211,
2213,2215,2217,2219,2221,2223,2225,2227,2229,
3001,3003,3010,3012,3026,3028,3029,3030,3031,3032,3033,3035,3037,3039,3041,3043,3045,3047,3049,3051,
3053,3055,3057,3058,3059,3061,3063,3065,3067,3069,3071,3073,3075,3077,3079,3081,3083,3085,3087,3089,
3091,3093,3095,3097,3099,3101,3103,3105,3107,3109,3111,3113,3115,3117,3119,3121,3123,3125,3127,3129,
3131,3133,3135,3137,3139,3141,3143,3145,3147,3149,3151,3155,3157,3159,3161,3163,3165,3167,3169,3171,
3173,3175,3177,3179,3181,3183,3185,3187,3189,3191,3193,3195,3197,3199,3201,3203,3205,3207,3209,3210,
3212,3214,3216,3218,3232,3234,3241,3243,
4010,4012,4026,4028,4030,4032,4035,4037,4039,4041,4043,4045,4047,4049,4051,4053,4055,4057,4059,4061,
4063,4065,4067,4069,4071,4073,4075,4077,4079,4081,4083,4085,4087,4089,4091,4093,4095,4097,4099,4101,
4103,4105,4107,4109,4111,4113,4115,4117,4119,4121,4123,4125,4127,4129,4131,4133,4135,4137,4139,4141,
4143,4145,4147,4149,4151,4155,4157,4159,4161,4163,4165,4167,4169,4171,4173,4175,4177,4179,4181,4183,
4185,4187,4189,4191,4193,4195,4197,4199,4201,4203,4205,4207,4210,4212,4214,4216,4218,4232,4234,4241,
4243,
];

const floors = [2, 3, 3, 3, 3, 4, 4, 4, 4];

roomtypes = [
    [''],
    [
        '','','','','','','','','','','','','','','D1','','D1','','D1','',
        'D1','','D1','','D1','','D1','','D1','','D1','','D1','','D1','','','','','',
        '','','','','','','','','','','','','','','','','','','','',
        '','','','','','','','','','','','','','','','','','','','',
        '','','','','','','','','','','','','','','','','','','','',
        '','','','','','','','','','','','','','','','','','','','',
        '','','','','','','','','','','','','','','','','','','','',
        '','','','','','','','','','','','','','','','','','','','',
        '','','','','','','','','','','','','','','','','','','','',
        '','','','','','','','','','','','','','','','','','','','',
        '','','','','','','','','','','D1','','D1','','D1','','D1','','D1','',
        'D1','','D1','','D1','','D1','','D1','','D1',   
    ],
    [
        'D1','','D1','','D1','T2RL','D1','T2RL','D1','K1RL','','K1RL','','K1RL','D1','K1RL','D1','K1RL','D1','K1RL',
'D1','K1RL','D1','K1RL','D1','K1RRC','','K1RRC','','','','','','','K3ECF2','','K1CC','','K1CC','',
'K1CC','','K1CC','','K1CC','','D1','','D1','','D1','','D1','','D1','','D1','','','',
'D1','','D1','','D1','','D1','','D1','','D1','','K1CC','','K1CC','','K1CC','','K1CC','',
'K1CC','','K3ECF2','','K1CC','','K1CC','','K1CC','','K1CC','','K1CC','','D1','','D1','','D1','',
'D1','','D1','','D1','','D1','','D1','','D1','','D1','','D1','','D1','','K1ZCQ2','',
'D1','','D1','','D1','','D1','','D1','','D1','','D1','','D1','','D1','','D1','',
'D1','','D1','','D1','','D1','','K1CC','','K1CC','','K1CC','K1CC','K1CC','','K3ECF2','','K1CC','',
'K1CC','','K1CC','','K1CC','','K1CC','','D1','','D1','','D1','','D1','','D1','','D1','',
'K1ARO2','','K1CC','','K1ZCQ2','','D1','','D1','','D1','','D1','','D1','','D1','','K1CC','',
'K1CC','','K1CC','','K1CC','','K1CC','','K3ECF2','','','K1RLF1','','K1RL','','K1RRC','','K1RL','','K1RL',
'D1','K1RL','D1','K1RL','D1','K1RL','D1','K1RL','D1','K1RL','D1','K1RL','','K1RL','','T2RL','D1','T2RL','D1','K1RLF1',
'D1','','D1','','D1',
    ],
    [
        'D1','K1JLF1','D1','T2RL','D1','T2RL','D1','K1RL','D1','K1RL','','K1RL','','K1RL','D1','K1RL','D1','K1RL','T2','K1RL',
'D1','K1RL','T2','K1RL','D1','K1RRC','','K1RL','','K1RRC','','K1RL','','K1RL','K3ECF2','','K1CC','','K1CC','',
'K1CC','','K1CC','','K1CC','','D1','','D1','','D1','','D1','','D1','','D1','','K1ZCQ2','',
'D1','','D1','','D1','','D1','','D1','','D1','','K1CC','','K1CC','','K1CC','','K1CC','',
'K1CC','','K3ECF2','','K1CC','','K1CC','','K1CC','','K1CC','','K1CC','','D1','','D1','','D1','',
'D1','','D1','','D1','','D1','','D1','','D1','','D1','','D1','','D1','','K1ZCQ2','',
'D1','','D1','','D1','','D1','','D1','','D1','','D1','','D1','','D1','','D1','',
'D1','','D1','','D1','','D1','','K1CC','','K1CC','','K1CC','K1CC','K1CC','','K3ECF2','','K1CC','',
'K1CC','','K1CC','','K1CC','','K1CC','','D1','','D1','','D1','','D1','','D1','','D1','',
'K1ARO2','','K1CC','','K1ZCQ2','','D1','','D1','','D1','','D1','','D1','','D1','','K1CC','',
'K1CC','','K1CC','','K1CC','','K1CC','','K3ECF2','K1RL','','K1RL','','K1RRC','','K1RL','','K1RRC','','K1RL',
'D1','K1RL','T2','K1RL','D1','K1RL','T2','K1RL','D1','K1RL','D1','K1RL','','K1RL','','K1RL','D1','T2RL','D1','T2RL',
'D1','','D1','','D1','K1JLF1',
    ],
];

function roomCreate(number, page, type, cb) {
  roomdetail = { number, page, type };
  console.log(roomdetail);

  const room = new Room(roomdetail);
       
    room.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    
    cb(null, room)
  });
};

function functions() {
    var functions = [];
    let floor;

    for (let page = 1; page <= 9; page++) 
        for (let number = roomnumbersOnPages[page - 1][0]; number <= roomnumbersOnPages[page - 1][1]; number++) {
            if (nonexistentRooms.indexOf(number) === -1) {
                functions.push(function(callback) {
                    floor = floors[page - 1];
                    roomCreate(number, page, roomtypes[floor - 1][number - 1000*floor], callback);
                });
            };
        }
    
    return functions;
} 

function createRooms(cb) {
    async.series(functions(),
        // optional callback
        cb);
};

function cleanerCreate(cleanerdetail, cb) {

    Cleaner.find({
        first_name: cleanerdetail.first_name,
        last_name: cleanerdetail.last_name
    }).exec((err, cleaners) => {
        if (err) {
            cb(err, null);
            return;
        }
        if (cleaners.length > 0) {
            cb(null, cleaners);
            return;
        }
        const cleaner = new Cleaner(cleanerdetail);
        
        cleaner.save(function (err) {
            if (err) {
              cb(err, null)
              return
            }
            console.log(cleanerdetail);
            cb(null, cleaner)
        })
    })};

function readCleanerFile(fileName, active, callback) {
    fs.readFile(fileName, "utf-8", function(err, data) {
        if (err) {
            callback(err, null);
            return;
        }
        const cleaners = data.split('\n').map(name => {
            const names = name.trim().split('_');
            const first_name = names[0];
            const last_name = names[1];
            return { first_name, last_name, active }
        });
        callback(null, cleaners);
        });
    };

function createGoneCleaners(cb) {
    readCleanerFile('gonecleaners.txt', false, (err, cleaners) => { 
        if (err) {
            console.error(err);
            return;
        }
        async.series(cleaners.map(cleaner => function(callback) { return cleanerCreate(cleaner, callback) }), cb);
      });
  }

function createCleaners(cb) {
    readCleanerFile('cleaners.txt', true, (err, cleaners) => {
        if (err) {
            console.error(err);
            return;
        }
        async.series(cleaners.map(cleaner => function(callback) { return cleanerCreate(cleaner, callback) }), cb);
      });
  }

function getServiceFiles(folderName) {
    const folderPath = path.join(__dirname, folderName);
    const isFile = fileName => {
        return fs.lstatSync(fileName).isFile();
      };
      
    return  fs.readdirSync(folderPath)
        .map(fileName => {
          return path.join(folderPath, fileName);
        })
        .filter(isFile);
}

const serviceFiles = getServiceFiles('ServiceData');
const serviceFileNames = serviceFiles.map(filePath => path.basename(filePath));

function readServiceFiles(cb) {
    async.series(serviceFiles.map(filePath => function(callback) { 
        fs.readFile(filePath, { encoding: 'utf-8'}, callback);
    }), cb)} 

function saveServiceFiles(fileDataItems, cb) {
    async.series(fileDataItems.map((fileData, index) => function(callback) {
        service_controller.saveSynergyFile(serviceFileNames[index], fileData, callback);
    }), cb)}

function uploadServiceFiles(cb) {
    async.waterfall([
        readServiceFiles,
        saveServiceFiles,
    ], cb)}

async.series([
    createRooms,
    createGoneCleaners,
    createCleaners,
    uploadServiceFiles,
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    // All done, disconnect from database
    mongoose.connection.close();
});
