const { Sequelize } = require('sequelize');
const { DB: DBConf } = require('../config.json')

const sequelize = new Sequelize(DBConf.name,
        DBConf.user,
        DBConf.password,
    {
        host: DBConf.host,
        define: {
            charset: 'utf8',
            collate: 'utf8_general_ci',
        },
        dialect: DBConf.dialect
    });

const { DiscordIDAddressMap} = require('./discordIdAddressMap')(sequelize);

const DB = {
    sequelize,
    Sequelize,
    DiscordIDAddressMap,
}

if(DBConf.enabled && DBConf.sync=== 1)  {
    console.log("synchronizing db schema...")
	sequelize.sync({alter:true}).then(function() {
		console.log("All models were synchronized successfully.");
	});
}

module.exports = {DB};