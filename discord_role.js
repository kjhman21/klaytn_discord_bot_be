const { holderClasses } = require('./config.json');

function GetHolderClass(klayamount) {
    var ret = undefined

    for(var i = 0; i < holderClasses.length; i++) {
        if(holderClasses[i].limit > klayamount) 
            break;
        ret = holderClasses[i];
    }
    if(ret === undefined)
        return undefined;
    return JSON.parse(JSON.stringify(ret));
}

module.exports = {
    GetHolderClass
}