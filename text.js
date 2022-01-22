let text = `these languages: I speak, this channel for music commands
⚠️you cant use!,
sorry but youre not dj!🎶, set
dj role is not,
join the same voice channel as me!,
paused!,
resumed!,
playlist shuffled!, repeat mode to
🔁 set,
repeat,
skipped!,
current queue:\n,
Its a little quiet here. Something play! *(atleast for me. 💕)*,
current queue filter:, autoplay mode to
set,
Cleared the whole queue. *quiet time!🔇*,
playskipped , as
🏠ryme command room set, exists
This channel does not. , admin privileges
you dont have!, already set up as:
ryme command room is,
dj mode is,
Discord. Js ping is,
ms,
volume,
filter,
loop,
loopqueue,
autoplay, an option from below
choose,
requested by,
added,
play,
playlist,
now playing,
playing,
language changed to:,
all queue,
this song, 60 seconds to cancel
enter anything else or wait,
songs,
to the queue, related video to play
Cant find. Music stop playing. ,
sorry I dont speak,
language, me
You got. I dont handle this case!, :
avalaible filters are,
on,
off,
list of all avalaible commands!\n +
> **1**. -> plays a given url or fetchs 1st youtube video play! _(!play **name**)_\n +
> **2**. Search -> searchs top 15 youtube videos! _(!search **name**)_\n +
> **3**. Pause -> pause current song! _(!pause)_\n +
> **4**. Resume -> resume paused song! _(!resume)_\n +
> **5**. Skip -> skip current song! _(!skip)_\n +
> **6**. Disconnect -> disconnect ryme! _(!disconnect)_\n +
> **7**. Shuffle -> shuffle current queue randomly! _(!shuffle)_\n +
> **8**. Loop -> loops current song! _(!loop)_\n +
> **9**. Loopqueue -> loops current queue! _(!loopqueue)_\n +
> **10**. Queue -> outputs current queue, with timestamps! _(!queue)_\n +
> **11**. Song volume -> changes the volume of played! _(!volume **0-100**)_\n +
> **12**. Filter -> applies sound filter! _(!filter **!ftypes**)_\n +
> **13**. Autoplay -> toggles autoplay _(!autoplay)_\n +
> **14**. Remove - remove song from queue! _(!remove **index**)_\n +
> **15**. Clear -> clears the whole queue _(!clear)_\n +
> **16**. Move -> move song to another positoin in queue _(!move **from index** **to index**)_\n +
> **17**. Another playskip -> skip current song and play! _(!playskip **name**)_\n +
> **18**. The room for commands setroom -> set! _(!setroom **room-name**)_\n +
> **19**. Dj -> toggles dj mode! _(!dj)_\n +
> **20**. Ping -> check ping! _(!ping)_\n +
> **21**. Filter types -> outputs all avalaible filter types! _(!ftypes)_\n +
> **22**. Language -> change the language of ryme messages! _(!lang **name**)_\n +
> **23**. Help -> outputs help box! _(!help)_\n +
> **24**. Fullhelp -> outputs full help box! _(!fullhelp)_,
Not finished.`;

let arr = text.split(',');
for (let i = 0; i < arr.length; ++i) {
  arr[i] = arr[i].replace('\n', '');
}
let langs = require('./langs.json');
let tA = [];
let i = 0;
for (w in langs.eng) {
  // tA.push(`"${w}":"${arr[i]}"`);
  tA.push(langs.eng[w]);
  i++;
}
console.log(tA);
