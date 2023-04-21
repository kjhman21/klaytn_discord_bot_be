const {Model, DataTypes, Sequelize} = require("sequelize");

class DiscordIDAddressMap extends Model {}

module.exports = (sequelize) => {
    DiscordIDAddressMap.init({
        discordId: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: true,
        },
        klaytnAddress: {
            type: DataTypes.STRING,
            unique:true,
        }
    },{
        sequelize: sequelize,
        modelName: 'discordIdAddressMap',
        charset:'utf8',
        collate:'utf8_unicode_ci',
		indexes:[{fields:['klaytnAddress']}]
    });

    return {DiscordIDAddressMap};
}