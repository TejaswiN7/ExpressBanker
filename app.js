/*-----------------------------------------------------------------------------
A simple Language Understanding (LUIS) bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
// This default message handler is invoked if the user's utterance doesn't
// match any intents handled by other dialogs.
var bot = new builder.UniversalBot(connector, function (session, args) {
    session.send('You reached the default message handler. You said \'%s\'.', session.message.text);
    
    
});

bot.set('storage', tableStorage);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;

// Create a recognizer that gets intents from LUIS, and add it to the bot
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);

// Add a dialog for each intent that the LUIS app recognizes.
// See https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-recognize-intent-luis 

bot.dialog('checkBalance',
    (session,args) => {
        var intent = args.intent;
        var balanceEntity = builder.EntityRecognizer.findEntity(intent.entities, 'balance');
        var accountEntity = builder.EntityRecognizer.findEntity(intent.entities, 'amount');
          if (balanceEntity) {
            session.send('Ok, sending your %s.', balanceEntity.entity);
            // Put your code here for calling a service that adds to a list.
        } else if(accountEntity) {
            
            session.send('Ok sending your balance');
            // Put your code here for calling the a service that creates a new default list.
        }
        
        session.endDialog();
    }
).triggerAction({
    matches: 'checkBalance'
});

bot.dialog('locateATM',
    (session,args) => {
        var intent = args.intent;
        var locationEntity = builder.EntityRecognizer.findEntity(intent.entities, 'location');
        var cityEntity= builder.EntityRecognizer.findEntity(intent.entities, 'builtin.geography.city');
        var streetEntity = builder.EntityRecognizer.findEntity(intent.entities, 'street');
          if (locationEntity) {
            session.send('Ok, locating an ATM near %s.',locationEntity.entity);
            // Put your code here for calling a service that adds to a list.
        } else if(cityEntity) {
            // Assuming default list to create
            //session.send('Ok, creating a new default list');
            session.send('Ok, locating an ATM near %s.', cityEntity.entity);
            // Put your code here for calling the a service that creates a new default list.
        }else if(streetEntity){
            session.send('Ok, locating an ATM near %s.', streetEntity.entity);
        }
        
        session.endDialog();
    }
).triggerAction({
    matches: 'locateATM'
});

bot.dialog('applyForLoan',
    (session,args) => {
        var intent = args.intent;
        var loanEntity = builder.EntityRecognizer.findEntity(intent.entities, 'loan');
        var interestEntity= builder.EntityRecognizer.findEntity(intent.entities, 'interest');
        var moneyEntity = builder.EntityRecognizer.findEntity(intent.entities, 'builtin.money');
          if (loanEntity) {
            session.send('Ok, calulating the loan amount.');
            // Put your code here for calling a service that adds to a list.
        } else if(interestEntity) {
            // Assuming default list to create
            //session.send('Ok, creating a new default list');
            session.send('Ok, calculating the interest amount.');
            // Put your code here for calling the a service that creates a new default list.
        }else if(moneyEntity){
            session.send('Ok, calculating the money.');
        }
        
        session.endDialog();
    }
).triggerAction({
    matches: 'applyForLoan'
});
bot.dialog('GreetingDialog',
    (session) => {
        session.send('You reached the Greeting intent. You said \'%s\'.', session.message.text);
        session.endDialog();
    }
).triggerAction({
    matches: 'Greeting'
});

bot.dialog('HelpDialog',
    (session) => {
        session.send('You reached the Help intent. You said \'%s\'.', session.message.text);
        session.endDialog();
    }
).triggerAction({
    matches: 'Help'
});

bot.dialog('CancelDialog',
    (session) => {
        session.send('You reached the Cancel intent. You said \'%s\'.', session.message.text);
        session.endDialog();
    }
).triggerAction({
    matches: 'Cancel'
});

