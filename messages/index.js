/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. 
For a complete walkthrough of creating this type of bot see the article at
http://docs.botframework.com/builder/node/guides/understanding-natural-language/
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'api.projectoxford.ai';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

bot.dialog('/', [
    function(session) {
        if (!session.userData.userName) {
        	// user is visiting first time, ask user his name
            builder.Prompts.text(session, "Hello, what is your name?");
        } else {
        	// user has visited earlier, begin welcome dialog
            session.beginDialog('/Welcome');
        }
    },
    //save user name to json file and set dialog data
    function(session, results) {
        var string = "{\"name\":\"" + results.response + "\"}";
        fs.writeFile('./data/name.json', string, function(err) {
            if (err) return console.log(err);
        });
        session.userData.userName = results.response;
        // begin welcome dialog
        session.beginDialog('/Welcome');
    }
]);

bot.dialog('/Welcome', [
    function(session) {
    	// welcome user and introduce bot
        var prompt = "Hello " + session.userData.userName + ", I am a pizza bot. I can help you place your order.\n\nPlease type menu or profile for options.";
        builder.Prompts.text(session, prompt);
    },
    function(session, results) {
        session.endDialog('You have selected %s.', results.response);
    }
]);    

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}

