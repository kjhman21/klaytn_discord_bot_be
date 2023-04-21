# KLAY holder verification Discord Bot

For frontend, please refer to [klaytn_discord_bot_fe](https://github.com/kjhman21/klaytn_discord_bot_fe).

## Setting up config.json

1. Copy `config.json.template` to `config.json`
```bash
cp config.json.template config.json
```

2. Update the fields accordingly.

```json
{
    // These are for discord settings. How to make a discord bot, please refer to https://discordjs.guide/preparations/setting-up-a-bot-application.html.
	"clientId": "1234456789123456789",
	"clientSecret":"",
	"guildId": "1234567891234567890",
	"token": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",

    // Frontend URL. This is also used for CORS, please make sure you setup it appropriately.
	"feUrl":"http://localhost:3000",

    // Holder class specification.
    // This is the data feeded to the frontend to show the table in the frontend.
    // Also, this data is used to determine the holder class.
    //
    // You can understand the data like below.
    // [1,100): fish role
    // [100,10000): tuna role
	"holderClasses": [
		{"limit":1, "role":"fish", "roleId": "1098097521412288574"},
		{"limit":100, "role":"tuna", "roleId": "1097681836823564439"},
		{"limit":10000, "role":"shark", "roleId": "1098097420719620211"},
		{"limit":10000000, "role":"unicorn", "roleId": "1098097475077816360"}
	],

	// can choose verify methods.
	"verifyMethod": {
		// currently it supports KLAY, KIP-7 and KIP-17
		"supportedMethods":["KLAY", "KIP-7", "KIP-17"],

		// Define methods from supported methods.
		"method":"KLAY",

		// If the method is KIP-7 or KIP-17, the contract address should be defined.
		"contractAddress":""
	},

    // Database settings.
	"DB": {
        // if it is true, use database. Otherwise, DB will not be used.
        // DB is used for preventing the following cases:
        //   1. Prevent for multiple accounts to use a single Klaytn address.
        //      If the address has been used for another discord account, previous account's role will be removed.
        //   2. Store the mapping between discord ID and klaytn address for updating roles.
        //      In the future, if the balance is changed, we need to also update the role accordingly.
        "enabled":true,

		// if sync === 1, database schema is updated according to the model definition in files, `/model`.
		"sync":1,

		// Below attributes are common attributes of databases.
		"name":"discord_bot",
		"user":"user",
		"password":"password",
		"host":"localhost",
		"dialect":"postgres"
	},

    // Port of the backend.
	"port":4001
}
```

## Registering the Bot to Your Discord Server

Please copy & paste the URL below to the browser after replacing `<client_id>` with your discord bot client ID.

```
https://discord.com/api/oauth2/authorize?client_id=<client_id>&permissions=17704124156928&scope=bot%20applications.commands
```

## Deploying the Command

By running the following command, you can deploy the command `verify-klay-holder`.
To deploy more command, add files in the `commands/` directory. Please refer to [klay.js](commands/verify/klay.js) for command implementation.

```bash
npm run discord_deploy_commands
```

## Running the Discord Bot Server

By running the following command, you can run your discord bot server.
This discord server has two roles: serving discord commands and API backed of the [frontend](https://github.com/kjhman21/klaytn_discord_bot_fe)

```bash
npm run start
```
