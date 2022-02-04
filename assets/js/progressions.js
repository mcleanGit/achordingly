var credentials = {
    username: null,
    password: null
}
// store oauth creds here
var sessionAuth;

// clear field upon click
$( ".username" ).click(function(event) {
    $("#username").val('')
})
// clear field upon click
$( ".password" ).click(function(event) {
    $("#password").val('')
})
// get the username and password
$( ".login" ).click(function(event) {
    credentials.username = $("#username").val()
    credentials.password = $("#password").val()
    auth()
    // localStorage.setItem(JSON.stringify(credentials))
})

function auth(){

    fetch('https://api.hooktheory.com/v1/users/auth', {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
            
        }
    })
    .then(function (resp) {

        // Return the response as JSON
        return resp.json();
    
    }).then(function (data) {
    
        // Log the API data
        console.log('token', data);
        if(data.name === 'Unauthorized'){
            alert(data.message)
        }
        if(data.username === credentials.username){
            // it worked
            sessionAuth = data
            console.log(sessionAuth)
            // hide the login dialog
            $( "#dialog" ).hide( "slow", function() {
                $('#dialog').dialog('close')
            });
        }
    }).catch(function (err) {
    
        // Log any errors
        console.log('something went wrong', err);
    
    })
}

// for now, store cmaj in an array. 
// TODO find either an api or a json that contains note names per each scale
var scales = {
    cmaj: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    gmaj: ['G', 'A', 'B', 'C', 'D', 'E', 'F#']
}

// watch for key & other chord choices
var song = {
    key: null,
    scale: null,
    progression: [],
    chord1: {
        name: null,
        degree: null
    }
}
$( ".progressionSetup" ).change(function(event) {
    console.log(event.target.name)
    switch(event.target.name){
        case 'key':
            song.key = $("#key option:selected").text()
            song.scale = scales[$("#key option:selected").attr('data-key')]
            // if we decide to incorporate other scale types. use major for now... 
            var degrees = scaleDegrees.major

            // clear the chord choices in chord1
            function removeOptions(selectElement) {
                var i, L = selectElement.options.length - 1;
                for(i = L; i >= 0; i--) {
                   selectElement.remove(i);
                }
             }
            removeOptions(document.getElementById('chord1'))

            // populate the chord selection with scale
            for(i=0;i<song.scale.length;i++){       
                $('<option/>').val(song.scale[i]).html(song.scale[i]).appendTo('#chord1');
            }
        break
        case 'chord1':
            song.chord1.name = $("#chord1 option:selected").text()
            song.chord1.degree = $("#chord1").prop('selectedIndex') + 1
            nextChord(song.chord1.degree)
        break
     
    }

})

//   mode: 'cors',
//   headers: {
//     'Access-Control-Allow-Origin':'*'
//   }
// https://chriscastle.com/proxy/index.php?:proxy:


function nextChord(childPath){
    // var url = 'https://api.hooktheory.com/v1/trends/nodes?cp=' + childPath
    var url = `https://chriscastle.com/proxy/hooktheory.php?cp=${childPath}&bearer=${sessionAuth.activkey}&nodes=1`
    console.log('Bearer ' + sessionAuth.activkey)
    // request a probable chord given first chord degree
    fetch(url, {
        // mode: 'no-cors',
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + sessionAuth.activkey,
            'Access-Control-Allow-Origin':'*'
        }
    })
    .then(function (resp) {
        console.log('resp', resp)
        // Return the response as JSON
        return resp;

    }).then(function (data) {

        console.log('135', data.body.json())
    }).catch(function (err) {

        // Log any errors
        console.log('something went wrong', err);

    })
}

var scaleDegrees = {
    "lydian": "1 2 3 4# 5 6 7",
    "major": "1 2 3 4 5 6 7",
    "mixolydian": "1 2 3 4 5 6 7b",
    "dorian": "1 2 3b 4 5 6 7b",
    "aeolian": "1 2 3b 4 5 6b 7b",
    "phrygian": "1 2b 3b 4 5 6b 7b",
    "locrian": "1 2b 3b 4 5b 6b 7b",
    "melodic minor": "1 2 3b 4 5 6 7",
    "melodic minor second mode": "1 2b 3b 4 5 6 7b",
    "lydian augmented": "1 2 3 4# 5A 6 7",
    "lydian dominant": "1 2 3 4# 5 6 7b",
    "melodic minor fifth mode": "1 2 3 4 5 6b 7b",
    "locrian #2": "1 2 3b 4 5b 6b 7b",
    "locrian major": "1 2 3 4 5b 6b 7b",
    "altered": "1 2b 3b 3 5b 6b 7b",
    "major pentatonic": "1 2 3 5 6",
    "lydian pentatonic": "1 3 4# 5 7",
    "mixolydian pentatonic": "1 3 4 5 7b",
    "locrian pentatonic": "1 3b 4 5b 7b",
    "minor pentatonic": "1 3b 4 5 7b",
    "minor six pentatonic": "1 3b 4 5 6",
    "minor hexatonic": "1 2 3b 4 5 7",
    "flat three pentatonic": "1 2 3b 5 6",
    "flat six pentatonic": "1 2 3 5 6b",
    "major flat two pentatonic": "1 2b 3 5 6",
    "whole tone pentatonic": "1 3 5b 6b 7b",
    "ionian pentatonic": "1 3 4 5 7",
    "lydian #5 pentatonic": "1 3 4# 5A 7",
    "lydian dominant pentatonic": "1 3 4# 5 7b",
    "minor #7 pentatonic": "1 3b 4 5 7",
    "super locrian pentatonic": "1 3b 4d 5b 7b",
    "in-sen": "1 2b 4 5 7b",
    "iwato": "1 2b 4 5b 7b",
    "hirajoshi": "1 2 3b 5 6b",
    "kumoijoshi": "1 2b 4 5 6b",
    "pelog": "1 2b 3b 5 6b",
    "vietnamese 1": "1 3b 4 5 6b",
    "vietnamese 2": "1 3b 4 5 7b",
    "prometheus": "1 2 3 4# 6 7b",
    "prometheus neopolitan": "1 2b 3 4# 6 7b",
    "ritusen": "1 2 4 5 6",
    "scriabin": "1 2b 3 5 6",
    "piongio": "1 2 4 5 6 7b",
    "major blues": "1 2 3b 3 5 6",
    "minor blues": "1 3b 4 5b 5 7b",
    "composite blues": "1 2 3b 3 4 5b 5 6 7b",
    "augmented": "1 2A 3 5 5A 7",
    "augmented heptatonic": "1 2A 3 4 5 5A 7",
    "dorian #4": "1 2 3b 4# 5 6 7b",
    "lydian diminished": "1 2 3b 4# 5 6 7",
    "whole tone": "1 2 3 4# 5A 7b",
    "leading whole tone": "1 2 3 4# 5A 7b 7",
    "harmonic minor": "1 2 3b 4 5 6b 7",
    "lydian minor": "1 2 3 4# 5 6b 7b",
    "neopolitan": "1 2b 3b 4 5 6b 7",
    "neopolitan minor": "1 2b 3b 4 5 6b 7b",
    "neopolitan major": "1 2b 3b 4 5 6 7",
    "neopolitan major pentatonic": "1 3 4 5b 7b",
    "romanian minor": "1 2 3b 5b 5 6 7b",
    "double harmonic lydian": "1 2b 3 4# 5 6b 7",
    "diminished": "1 2 3b 4 5b 6b 6 7",
    "harmonic major": "1 2 3 4 5 6b 7",
    "double harmonic major": "1 2b 3 4 5 6b 7",
    "egyptian": "1 2 4 5 7b",
    "hungarian minor": "1 2 3b 4# 5 6b 7",
    "hungarian major": "1 2A 3 4# 5 6 7b",
    "oriental": "1 2b 3 4 5b 6 7b",
    "spanish": "1 2b 3 4 5 6b 7b",
    "spanish heptatonic": "1 2b 3b 3 4 5 6b 7b",
    "flamenco": "1 2b 3b 3 4# 5 7b",
    "balinese": "1 2b 3b 4 5 6b 7",
    "todi raga": "1 2b 3b 4# 5 6b 7",
    "malkos raga": "1 3b 4 6b 7b",
    "kafi raga": "1 3b 3 4 5 6 7b 7",
    "purvi raga": "1 2b 3 4 4# 5 6b 7",
    "persian": "1 2b 3 4 5b 6b 7",
    "bebop": "1 2 3 4 5 6 7b 7",
    "bebop dominant": "1 2 3 4 5 6 7b 7",
    "bebop minor": "1 2 3b 3 4 5 6 7b",
    "bebop major": "1 2 3 4 5 5A 6 7",
    "bebop locrian": "1 2b 3b 4 5b 5 6b 7b",
    "minor bebop": "1 2 3b 4 5 6b 7b 7",
    "mystery #1": "1 2b 3 5b 6b 7b",
    "enigmatic": "1 2b 3 5b 6b 7b 7",
    "minor six diminished": "1 2 3b 4 5 6b 6 7",
    "ionian augmented": "1 2 3 4 5A 6 7",
    "lydian #9": "1 2b 3 4# 5 6 7",
    "ichikosucho": "1 2 3 4 5b 5 6 7",
    "six tone symmetric": "1 2b 3 4 5A 6"
  }