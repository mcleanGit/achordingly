var credentials = {
    username: null,
    password: null
}
// // store oauth creds here
// var sessionAuth;

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
    systemMsg('Logging in...')
    auth()
    // localStorage.setItem(JSON.stringify(credentials))
})

// this function gets the bearer token given the user's login info
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
        if(data.name === 'Unauthorized'){
            alert(data.message)
        }
        if(data.username === credentials.username){
            // it worked
            systemMsg('Signed In!')
            // store bearer token in localStorage (note that this will expire)
            localStorage.setItem("hookTheoryBearerToken", data.activkey)
            // hide the login dialog
            $( "#dialog" ).hide( "slow", function() {
                $('#dialog').dialog('close')
            });
        }
    }).catch(function (err) {
        // Log any errors
        console.log('Error in auth fetch: ', err);
    })
}

// TODO find either an api or a json that contains note names per each scale
var keys = {
    major: ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'],
    minor: ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B']
}

// this will be confusing... key & keys refer to the object, not in music theory
Object.keys(keys).forEach(key => {
    for(i=0;i<keys[key].length; i++){
        var quality = key
        var thisKey = keys[key][i]
        var text = thisKey + ' ' +  quality
        var val = thisKey + '_' + quality
        $('<option/>').val(val).html(text).appendTo('#chord1');
    }
})
// watch for key & other chord choices
//! for william: this will be what gets saved in the user's progression save
var progression = {
    key: null,
    scale: [],
    progression: [],
    chord1: {
        
        name: null, // i.e. C, E, G (pulled from keys.major or keys.minor)
        degree: 1, // hardcoded for now (1 means first note in the scale)
        quality: null // major or minor
    },
    chord2:{
        name: null,
        degree: null, // the degree is relative to chord1's degree, and is in fact what hooktheory returns
        numeral: null // this is currently what is populated into the dropdown. 
    }
}

// given chord choices in the dropdown of either column 1 or column 2:
$( ".chordSetup" ).change(function(event) {
    switch(event.target.name){
        case 'chord1':
            progression.chord1.name = $("#chord1 option:selected").text()
            progression.key = progression.chord1.name.split(' ')[0]
            progression.chord1.quality = progression.chord1.name.split(' ')[1]
            // clear any suggested chord2 content
            clearChord2()
            // chord column number here is 2, scale degree, chord name
            nextChord(2, progression.chord1.degree, progression.chord1.name)
        break
        case 'chord2':
            progression.chord2.numeral = $("#chord2 option:selected").text()
            $('.chord2diagram').text('guitar diagram: ' + progression.chord2.numeral)
        break
     
    }

})

function nextChord(chordNumber, degree, name){
    systemMsg('Accessing chord database, please wait...')
    var bearerToken = localStorage.getItem("hookTheoryBearerToken")
    // var url = 'https://api.hooktheory.com/v1/trends/nodes?cp=' + childPath
    var url = `https://chriscastle.com/proxy/hooktheory.php?cp=${degree}&bearer=${bearerToken}&nodes`
    // request a probable chord given first chord degree
    fetch(url,{
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    })
    .then(function (resp) {
        // Return the response as JSON
        return resp.json();

    }).then(function (data) {

        // console.log('final', data)
        suggestChord(chordNumber, name, data)
    }).catch(function (err) {

        // Log any errors
        console.log('error in nextChord fetch: ', err);

    })
}

function suggestChord(chordNumber, name, probabilities){
    switch(chordNumber){
        case 2:
            // reset the selectmenu
            clearChord2()
            // create the selectmenu
            for(i=0;i<6;i++){
                $('<option/>').val(probabilities[i].chord_HTML).html(probabilities[i].chord_HTML).appendTo('#chord2');
            }
            systemMsg('Chord suggestions returned!')
        break
        // add case 3 for if we want a third column for a chord... 
    }
}

function clearChord2(){
    $('.chord2diagram').text('')
    function removeOptions(selectElement) {
        var i, L = selectElement.options.length - 1;
        for(i = L; i >= 0; i--) {
            selectElement.remove(i);
        }
    }
    removeOptions(document.getElementById('chord2'))
}

function systemMsg(msg){
    $('.systemMsg').text(msg)
}