var Subscriber = require('../models/Subscriber');
var config = require('../config');

// Create a function to handle Twilio SMS / MMS webhook requests
exports.webhook = function(request, response) {

    // Get the user's phone number
    var phone = request.body.From;

    // Try to find a subscriber with the given phone number
    Subscriber.findOne({
        phone: phone
    }, function(err, sub) {
        if (err) return respond('Please text back again later.');

        if (!sub) {
            // If there's no subscriber associated with this phone number, create one
            var newSubscriber = new Subscriber({
                phone: phone
            });

            newSubscriber.save(function(err, newSub) {
                if (err || !newSub) {
                    return respond('We couldn\'t sign you up - try again.');
                }

                // We're signed up but not subscribed - prompt to subscribe
                respond('Thanks for contacting us! Text "START" to receive updates via text message.');
            });
        } else {
            // For an existing user, process any input message they sent and send back an appropriate message
            processMessage(sub);
        }
    });

    // Process any message the user sent to us
    function processMessage(subscriber) {
        // get the text message command sent by the user
        var msg = request.body.Body || '';
        msg = msg.toLowerCase().trim();

        console.log('MSG::: ' + subscriber.phone + ' ' + msg);

        // Conditional logic to do different things based on the command from the user
        var sub_commands = ['subscribe','sub','start'];
        var unsub_commands = ['unsubscribe','unsub','stop'];
        var commands = sub_commands.concat(unsub_commands);

        if (commands.indexOf(msg) >= 0) {
        //if (msg === 'subscribe' || msg === 'unsubscribe' || msg === 'unsub') {
            // If the user has elected to subscribe for messages, flip the bit and indicate that they have done so.
            subscriber.subscribed = (sub_commands.indexOf(msg) >= 0);
            subscriber.save(function(err) {
                if (err) {
                    return respond('We could not subscribe you - please try again with START.');
                }

                // Otherwise, our subscription has been updated
                if (subscriber.subscribed) {
                    respond('You are now subscribed for updates.');
                } else {
                    console.log('MSG::: ' + subscriber.phone + ' has unsubscribed.');
                }
            });
        } else {
            // If we don't recognize the command, text back with the list of available commands
            var responseMessage = 'Sorry, we didn\'t understand that. available commands are: START or STOP';
            respond(responseMessage);
        }
    }

    // Set Content-Type response header and render XML (TwiML) response in a
    // Jade template - sends a text message back to user
    function respond(message) {
        response.type('text/xml');
        response.render('twiml', {
            message: message
        });
    }
};

// Handle form submission
exports.sendMessages = function(request, response) {
    console.log('sendMessages');
    // Get message info from form submission
    var message = request.body.message;
    var imageUrl = request.body.imageUrl;
    var token = request.body.token;

    if (config.token != token) {
        request.flash('errors', 'Invalid token');
        return response.redirect('/');
    }

        // Use model function to send messages to all subscribers
    Subscriber.sendMessage(message, imageUrl, function(err) {
        if (err) {
            request.flash('errors', err.message);
        } else {
            request.flash('successes', 'Messages on their way!');
        }

        response.redirect('/');
    });
};
