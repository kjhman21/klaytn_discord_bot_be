const { request } = require('undici');
const express = require('express');
const { clientId, clientSecret, port } = require('./config.json');
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { channelId, guildId, feUrl, holderClasses, verifyMethod } = require('./config.json');
const Caver = require('caver-js');
const { client } = require('./discord_bot');
var cors = require('cors');
const bodyParser = require('body-parser');
const { GetHolderClass } = require('./discord_role');
const {DB} = require('./model')

const app = express();

var whitelist = [feUrl];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true) } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

async function clearAllRoles(guild, user) {
	for (var i = 0; i < holderClasses.length; i++) {
		await guild.members.removeRole({
			user,
			role: holderClasses[i].roleId,
		})
	}
}

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.get('/class/klay', (_, res)=> {
	return res.json(holderClasses)
})

app.get('/', async ({ query }, response) => {
	const { code } = query;
	var userResult = {};
	var result = {}

	if (code) {
		try {
			const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
				method: 'POST',
				body: new URLSearchParams({
					client_id: clientId,
					client_secret: clientSecret,
					code,
					grant_type: 'authorization_code',
					redirect_uri: feUrl,
					scope: 'identify',
				}).toString(),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});

			const oauthData = await tokenResponseData.body.json();

			userResult = await request('https://discord.com/api/users/@me', {
				headers: {
					authorization: `${oauthData.token_type} ${oauthData.access_token}`,
				},
			});

			result = await userResult.body.json();
		} catch (error) {
			// NOTE: An unauthorized token will not throw an error
			// tokenResponseData.statusCode will be 401
			console.error(error);
		}
	}

	return response.json(result);
});

app.get('/verifymethod', async (req,res)=> {
	return res.json({
		method: verifyMethod.method,
		contractAddress: verifyMethod.contractAddress
	})
})

app.post('/', async (req, res) => {

	// verify the userId and wallet address first.
	const address = req.body.address;
	const userId = req.body.id;
	const username = req.body.username;
	const signature = req.body.signature;
	const timestamp = req.body.timestamp;
	const message = `Address: ${address.toLowerCase()}\nDiscord ID: ${userId}\nDiscord Username: ${username}\nVerifyMethod: ${verifyMethod.method}\nContractAddress: ${verifyMethod.contractAddress}\nTimestamp ${timestamp}`;

	try
	{
		// need to check the timestamp is too far from now.
		const now = new Date().getTime();
		if(Math.abs(now - timestamp) > 1000*60) {
			throw "timestamp is too far from now";
		}

		// verify the signature
		const caver = new Caver('https://public-en-cypress.klaytn.net');
		const sigdata = caver.utils.decodeSignature(signature);
		const verified = await caver.validator.validateSignedMessage(message, sigdata, address);
		if(!verified) {
			throw "signature verification failed";
		}

		const guild = client.guilds.cache.get(guildId);

		if(DB.enabled) {
			// Check the address is already used. In this case, the previous discordid's role will be removed first.
			const r = await DB.DiscordIDAddressMap.findAll({where:{klaytnAddress:address}});
			for(var i = 0; i < r.length; i++) {
				await clearAllRoles(guild, userId);
				// remove the rows only if the discord id is different.
				if(r[i].dataValues.discordId !== userId) {
					await DB.DiscordIDAddressMap.destroy({where:{klaytnAddress:address}});
				}
			}
		}

		var balance = 0;
		if(verifyMethod.method === "KLAY") {
			var balanceInPeb = await caver.rpc.klay.getBalance(address)
			balance = parseFloat(caver.utils.convertFromPeb(balanceInPeb))
		} else if(verifyMethod.method === "KIP-7") {
			const kip7 = new caver.kct.kip7(verifyMethod.contractAddress);

			const balanceInPeb = await kip7.balanceOf(address);
			const decimals = await kip7.decimals();
			var div = 10**decimals
			balance = parseFloat(balanceInPeb.div(div));
		} else if(verifyMethod.method === "KIP-17") {
			const kip17 = new caver.kct.kip17(verifyMethod.contractAddress);

			balance = await kip17.balanceOf(address);;
		}

		var role = GetHolderClass(balance);

		if(role) {
			await clearAllRoles(guild, userId);
			await guild.members.addRole({
				user: userId,
				role: role.roleId, 
			})
			console.log(`role added successfully. userId:${userId}, role:${role.roleId}, address:${address}`)
		} else {
			console.log(`role is not added because the balance is not in the range. balance=${balance}, address=${address}`)
		}

		// Put the message to the verifier channel
		let member = await guild.members.fetch(userId);
		let embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Role Updated')
			.setAuthor({name:`Klaytn PoH Bot`})
			.setDescription(`${member.user.username} got the role of ${role.role}!`);
		guild.channels.cache.get(channelId).send({embeds:[embed]})
			.catch((err) => console.log(err));

		// update database.
		if(DB.enabeld) {
			await DB.DiscordIDAddressMap.upsert({discordId:userId, klaytnAddress:address});
		}

	} catch(error) {
		// NOTE: An unauthorized token will not throw an error
		// tokenResponseData.statusCode will be 401
		console.error(error);
		return res.status(404).json({error: ""+error})
	}

	return res.sendStatus(200);
})

app.listen(port, () => console.log(`App listening at the port ${port}`));
