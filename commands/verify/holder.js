const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { clientId, feUrl } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('verify-holder')
		.setDescription('Verify you are a holder!'),
	async execute(interaction) {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Verify')
                    .setURL(`https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(feUrl)}&response_type=code&scope=identify`)
                    .setStyle(ButtonStyle.Link)
            )
		return interaction.reply({content: "Please click the below button to verify you're the holder!", ephemeral: true, components:[row]});
	},
};