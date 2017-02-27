var sub_commands = ['subscribe','start'];
var unsub_commands = ['unsubscribe','unsub','stop'];
var commands = sub_commands.concat(unsub_commands);

console.log('is command:'+ (commands.indexOf('sds') >= 0));
console.log('is command:'+ (commands.indexOf('start') >= 0));
console.log('is start:'+ (sub_commands.indexOf('start') >= 0));
console.log('is stop:'+ (unsub_commands.indexOf('stop') >= 0));
console.log('is stop:'+ (unsub_commands.indexOf('df') >= 0));

