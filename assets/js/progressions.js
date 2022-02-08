/* LOGIN/CREDENTIALS
*
*/
var credentials = {
    username: null,
    password: null
}


// if the user signs out, reset the login creds and relaunch the login dialog
$( "#userAccountMenu" ).change(function(event) {
    
    var choice = $("#userAccountMenu option:selected").text()
    if(choice === 'Sign Out'){
        // clear credentials from localStorage
        credentials.username = null
        credentials.password = null
        localStorage.removeItem('username')
        localStorage.removeItem('password')
        // clear useraccount menu
        function removeOptions(selectElement) {
            var i, L = selectElement.options.length - 1;
            for(i = L; i >= 0; i--) {
                selectElement.remove(i);
            }
        }
        removeOptions(document.getElementById('userAccountMenu'))

        
        $( "#dialog" ).dialog({
            show: { effect: "blind", duration: 500 }
        });
    }
})
// if no stored username data...
if(localStorage.getItem('username') === null){
    $( "#dialog" ).dialog({
        show: { effect: "blind", duration: 500 }
      });
} else {
    
    $( "#login-box" ).hide()
    // get credentials
    credentials.username = localStorage.getItem('username')
    credentials.password = localStorage.getItem('password')
    // start ooAuth. false tells it not to hide dialog or store password (both are redundant)
    oAuth(false)
}

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
    oAuth(true)
})

// this function gets the bearer token given the user's login info
function oAuth(dialog){
    // dialog is a boolean for whether the user entered their credentials, or the credentials were pulled from localStorage
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
            console.log(data)
            $('<option/>').val(credentials.username).html(credentials.username).appendTo('#userAccountMenu');
            $('<option/>').val('Sign Out').html('Sign Out').appendTo('#userAccountMenu');
            // store bearer token in localStorage (note that this will expire)
            localStorage.setItem("hookTheoryBearerToken", data.activkey)
            // user signed in using the login dialog, so store credentials and then hide the login dialog
            if(dialog === true){
                // store username in localStorage
                localStorage.setItem('username', credentials.username)
                // store password in localStorage
                localStorage.setItem('password', credentials.password)
                // hide login modal
                // $( "#login-box" ).hide()
                // $('.signin').modal('hide');
                // var div = $(this).closest('div.reveal-modal').first();
                loginModal.close()
                // $( "#dialog" ).hide( "slow", function() {
                //     $('#dialog').dialog('close')
                // });
            }
        }
    }).catch(function (err) {
        // Log any errors
        console.log('Error in oAuth fetch: ', err);
    })
}

// MUSIC THEORY STUFF
// TODO find either an api or a json that contains note names per each scale
var keys = {
    major: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],
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
    keyInfo: null, // uses tonalJS to grab lots of info about the key
    scale: [],
    progression: [],
    chord1: {
        
        name: null, // i.e. C, E, G (pulled from keys.major or keys.minor)
        degree: 1, // hardcoded for now (1 means first note in the scale)
        quality: null, // major or minor
        chordID: null // communication with hooktheoryAPI
    },
    chord2:{
        name: null,
        degree: null, // the degree is relative to chord1's degree, and is in fact what hooktheory returns
        chordID: null // this is how we communicate chords with hooktheory api
    },
    mostCommonAfter2:{
        chords: []
    }
}

function getChord(chordName){

}
// given chord choices in the dropdown of either column 1 or column 2:
$( ".chordSetup" ).change(function(event) {
    console.log('event', event.target.name)
    switch(event.target.name){
        case 'chord1':
            progression.chord1.name = $("#chord1 option:selected").text()
            // if sharp/flat chosen, just get the sharp
            if(progression.chord1.name.includes('/')){
                progression.chord1.name = progression.chord1.name.split('/')[1]
            }
            progression.key = progression.chord1.name.split(' ')[0]
            progression.chord1.quality = progression.chord1.name.split(' ')[1]
            // major or minor
            switch(progression.chord1.quality){
                case 'major':
                    progression.keyInfo = Tonal.Key.majorKey(progression.key)

                break;
                case 'minor':
                    progression.keyInfo = Tonal.Key.minorKey(progression.key)

                break;
            }
            
            // clear any suggested chord2 content
            clearChord2()
            // chord column number here is 2, scale degree, chord name
            nextChord(2, progression.chord1.degree, progression.chord1.name)
        break
        case 'chord2':
            progression.chord2.name = $("#chord2 option:selected").text()
            progression.chord2.chordID = $("#chord2 option:selected").val()
            // $('.chord2diagram').text('guitar diagram: ' + progression.chord2.numeral)

            // now grab suggested chords for column 3 based on selected chord 2
            console.log(progression.chord2.chordID)
            chord = Tonal.RomanNumeral.get(num);
            console.log(chord)
            degree = chord.step + 1
            nextChord(3, degree, name)
        break
    }
})
$( "#chordListColumn3" ).on("click", function(event) {
    console.log(event.target)
    degree = event.target.dataset.chordid
    // needs to reset the chord in column 1

    // add chord to menu, make it selected
    $('<option/>').val(degree).html(event.target.dataset.chord).appendTo('#chord1');
    // make it selected
    $('#chord1').val(degree);
    // $("#chord1").selectmenu("refresh");
    // 
    nextChord(2, degree, event.target.dataset.chord)

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
                num = probabilities[i].chord_HTML
                // remove html tags
                num = num.replace(/<[^>]+>/g, '').toUpperCase();
                // if chord has a number in it
                if(/\d/.test(num) === true){
                    num = num.split(/[0-9]/)[0] // + quality + num.split(/[0-9]/)[1]
                    } 
                // get number from numeral
                chord = Tonal.RomanNumeral.get(num);

                // find the scale index of the number. caveat: tonaljs has different objects for natural and harmonic/medolic minor keys, so get the natural?
                var index;
                if(progression.keyInfo.type === 'major'){
                    var step = chord.step
                    // get chord name given scale index and key chord array
                    chordName = progression.keyInfo.chords[step]
                } else {
                    var step = chord.step
                    // get chord name given scale index and key chord array
                    chordName = progression.keyInfo.natural.chords[step]
                }
                
                
                // add chord names to the chord2 dropdown menu
                $('<option/>').val(num).html(chordName).appendTo('#chord2');
            }
            systemMsg('Chord suggestions returned!')

            
        break
        // list of suggested chords that would follow chord 2
        case 3:
            console.log(chordNumber, probabilities)

            // reset the list
            // clearChord2()

            // create the list
            for(i=0;i<6;i++){
                num = probabilities[i].chord_HTML
                chordID = probabilities[i].chord_ID
                // remove html tags
                num = num.replace(/<[^>]+>/g, '').toUpperCase();
                // get number from numeral
                chord = Tonal.RomanNumeral.get(num);
                // if chord has a number in it
                if(/\d/.test(num) === true){
                    num = num.split(/[0-9]/)[0] // + quality + num.split(/[0-9]/)[1]
                } 
                // find the scale index of the number. caveat: tonaljs has different objects for natural and harmonic/medolic minor keys, so get the natural?
                var index;
                if(progression.keyInfo.type === 'major'){
                    var step = chord.step
                    // get chord name given scale index and key chord array
                    chordName = progression.keyInfo.chords[step]
                } else {
                    var step = chord.step
                    // get chord name given scale index and key chord array
                    chordName = progression.keyInfo.natural.chords[step]
                }
                
                var chord_chordID = chordName + '_' + chordID
                
                // add chord names to the list
                $('<li/>').val(chordID).html(`<a data-chord=${chordName} data-chordID=${chordID}>${chordName}</a>`).appendTo('#chordListColumn3');
            }
        break;
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