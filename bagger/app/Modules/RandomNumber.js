var Promise = require('promise');

function randomNumber(chartSet, length) {
    try {
        return new Promise((resolve, reject) => {
            var randomstring = ''
            for ( var i = 0; i < length; i++) {
                var generateRandom = Math.floor(Math.random() * chartSet.length);
                randomstring += chartSet.substring(generateRandom, generateRandom + 1)
            }
            resolve(randomstring)
        })

    } catch (error) {
        console.log('RandomNumber.randomNumber || Error: ', error)
    }
}

module.exports = {
    random : randomNumber
}