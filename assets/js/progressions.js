

/* LOGIN/CREDENTIALS
*
*/
var credentials = {
    username: null,
    password: null
}

// $(".funNavBar").click(function (event) {
//     console.log(event.target)
// })
$("#userAct li").on("click", function(){
    var choice = $(this).text()
    switch (choice){
        case "Logout":

                // clear credentials from localStorage
                credentials.username = null
                credentials.password = null
                localStorage.removeItem('username')
                localStorage.removeItem('password')
                // clear useraccount menu
                // function removeOptions(selectElement) {
                //     var i, L = selectElement.options.length - 1;
                //     for(i = L; i >= 0; i--) {
                //         selectElement.remove(i);
                //     }
                // }
                // removeOptions(document.getElementById('userAccountMenu'))

                // TODO remove Login menu from DOM, or at least hide it. 

                // TODO reload page
                location.reload();
                return false;

                // $( "#dialog" ).dialog({
                //     show: { effect: "blind", duration: 500 }
                // });

        break
    }
  
  });

// if the user signs out, reset the login creds and relaunch the login dialog
$( "#userAccountMenu" ).change(function(event) {

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
            // hide newUser message once signed in
            $('.newUser').hide()
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
                // loginModal.close()
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
    userSavedName: "",
    key: null,
    keyInfo: null, // uses tonalJS to grab lots of info about the key
    scale: [],
    progression: [],
    chord1: {
        
        name: null, // i.e. C, E, G (pulled from keys.major or keys.minor)
        degree: 1, // hardcoded for now (1 means first note in the scale)
        quality: null, // major or minor
        chordID: 1 // communication with hooktheoryAPI
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

// given chord choices in the dropdown of either column 1 or column 2:
$( ".chordSetup" ).change(function(event) {
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
            // remove diagrams from container
            $( ".chord1DiagramContainer" ).empty();
            // add/re-add the div diagrams in the DOM
            $(".chord1DiagramContainer").append(`<div class="chord1fretboard scales_chords_api" chord="${progression.chord1.name}"></div>`)
            $(".chord1DiagramContainer").append(`<div class="chord1fretboardSound scales_chords_api" chord="${progression.chord1.name}" output="sound"></div>`)
            $(".chord1DiagramContainer").append(`<div class="chord1piano scales_chords_api" instrument="piano"  chord="${progression.chord1.name}"></div>`)
            $(".chord1DiagramContainer").append(`<div class="chord1pianoSound scales_chords_api" instrument="piano" chord="${progression.chord1.name}" output="sound"></div>`)
            diagram(".chord1fretboard", progression.chord1.name)
            diagram(".chord1piano", progression.chord1.name)
            diagram(".chord1fretboardSound", progression.chord1.name)
            diagram(".chord1pianoSound", progression.chord1.name)
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
            chord = Tonal.RomanNumeral.get(num);
            degree = chord.step + 1
            
            // remove diagrams from container
            $( ".chord2DiagramContainer" ).empty();
            // add/re-add the div diagrams in the DOM
            $(".chord2DiagramContainer").append(`<div class="chord2fretboard scales_chords_api" chord="${progression.chord2.name}"></div>`)
            $(".chord2DiagramContainer").append(`<div class="chord2fretboardSound scales_chords_api" chord="${progression.chord2.name}" output="sound"></div>`)
            $(".chord2DiagramContainer").append(`<div class="chord2piano scales_chords_api" instrument="piano"  chord="${progression.chord2.name}"></div>`)
            $(".chord2DiagramContainer").append(`<div class="chord2pianoSound scales_chords_api" instrument="piano" chord="${progression.chord2.name}" output="sound"></div>`)
            // update diagrams
            diagram(".chord2fretboard", progression.chord2.name)
            diagram(".chord2piano", progression.chord2.name)
            diagram(".chord2fretboardSound", progression.chord2.name)
            diagram(".chord2pianoSound", progression.chord2.name)

            nextChord(3, degree, name)
        break
    }
})

$( "#chordListColumn3" ).on("click", function(event) {
    degree = event.target.dataset.chordid
    progression.chord1.chordID = degree
    // needs to reset the chord in column 1

    // add chord to menu, make it selected
    $('<option/>').val(degree).html(event.target.dataset.chord).appendTo('#chord1');
    // make it selected
    $('#chord1').val(degree);

    // remove diagrams from container
    $( ".chord1DiagramContainer" ).empty();
    // add/re-add the div diagrams in the DOM
    $(".chord1DiagramContainer").append(`<div class="chord1fretboard scales_chords_api" chord="${progression.chord1.name}"></div>`)
    $(".chord1DiagramContainer").append(`<div class="chord1fretboardSound scales_chords_api" chord="${progression.chord1.name}" output="sound"></div>`)
    $(".chord1DiagramContainer").append(`<div class="chord1piano scales_chords_api" instrument="piano"  chord="${progression.chord1.name}"></div>`)
    $(".chord1DiagramContainer").append(`<div class="chord1pianoSound scales_chords_api" instrument="piano" chord="${progression.chord1.name}" output="sound"></div>`)
    // update diagrams
    diagram(".chord1fretboard", event.target.dataset.chord)
    diagram(".chord1piano", event.target.dataset.chord)
    diagram(".chord1fretboardSound", event.target.dataset.chord)
    diagram(".chord1pianoSound", event.target.dataset.chord)

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

        console.log(data)
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

            // hack to prevent duplicate chords in menu
            var theseChords = []
            // create the selectmenu
            var j = 6 // need this to be variable in case there are duplicate chords. 
            for(i=0;i<j;i++){
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
                
                if(chordName.includes('maj7')){
                    // remove maj7, its confusing to guitarists and redundant
                    chordName = chordName.replace('maj7', '')
                } else if(chordName.includes('m7')){
                    // remove maj7, its confusing to guitarists and redundant
                    chordName = chordName.replace('m7', 'm')
                }

                
                // here is where we need to fire chord selection2 so that list 3 populates. 
                if(i===0){
                    progression.chord2.name = chordName
                    progression.chord2.chordID = probabilities[i].chord_ID
                    // $('.chord2diagram').text('guitar diagram: ' + progression.chord2.numeral)
        
                    // now grab suggested chords for column 3 based on selected chord 2
                    chord = Tonal.RomanNumeral.get(num);

                    degree = chord.step + 1
                    
                    // remove diagrams from container
                    $( ".chord2DiagramContainer" ).empty();
                    // add/re-add the div diagrams in the DOM
                    $(".chord2DiagramContainer").append(`<div class="chord2fretboard scales_chords_api" chord="${progression.chord2.name}"></div>`)
                    $(".chord2DiagramContainer").append(`<div class="chord2fretboardSound scales_chords_api" chord="${progression.chord2.name}" output="sound"></div>`)
                    $(".chord2DiagramContainer").append(`<div class="chord2piano scales_chords_api" instrument="piano"  chord="${progression.chord2.name}"></div>`)
                    $(".chord2DiagramContainer").append(`<div class="chord2pianoSound scales_chords_api" instrument="piano" chord="${progression.chord2.name}" output="sound"></div>`)
                    // update diagrams
                    diagram(".chord2fretboard", progression.chord2.name)
                    diagram(".chord2piano", progression.chord2.name)
                    diagram(".chord2fretboardSound", progression.chord2.name)
                    diagram(".chord2pianoSound", progression.chord2.name)
                    nextChord(3, degree, name)
                }
                // prevent chord being added twice (this is a quick fix)
                if(theseChords.includes(chordName)){
                    console.log('filtered', chordName)
                    // add another index to search through the array of returned chords
                    j++
                } else {
                    // add chord names to the chord2 dropdown menu
                    $('<option/>').val(num).html(chordName).appendTo('#chord2');
                    theseChords.push(chordName)
                }

            }
            systemMsg('Chord suggestions returned!')

            
        break
        // list of suggested chords that would follow chord 2
        case 3:

            // reset the list
            $('.chordListColumn3').empty()

            // hack to prevent duplicate chords in menu
            var theseChords = []
            // create the selectmenu
            var j = 6 // need this to be variable in case there are duplicate chords. 
            for(i=0;i<j;i++){
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
                
                if(chordName.includes('maj7')){
                    // remove maj7, its confusing to guitarists and redundant
                    chordName = chordName.replace('maj7', '')
                } else if(chordName.includes('m7')){
                    // remove maj7, its confusing to guitarists and redundant
                    chordName = chordName.replace('m7', 'm')
                }
                
                // prevent chord being added twice (this is a quick fix)
                if(theseChords.includes(chordName)){
                    console.log('filtered', chordName)
                    // add another index to search through the array of returned chords
                    j++
                } else {
                    // add chord names to the list
                    $('<li/>').val(chordID).html(`<a data-chord=${chordName} data-chordID=${chordID}>${chordName}</a>`).appendTo('#chordListColumn3');
                    theseChords.push(chordName)
                }
            }
        break;
    }
}

function clearChord2(){
    // $('.chord2diagram').text('')
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

// diagrams
function diagram(selector, chord){
    console.log(selector)
    var diagram = document.querySelector(selector)
    diagram.setAttribute('chord', chord)
    scales_chords_api_onload()

}

// Save progression
var saveSessionButton = $("#SaveSession");
var currentStorage = [null]; // ask if to add savename to changes object so we don't have to inherit
var historySelect = $('#HistoryID');

if(localStorage.getItem('progressionStorage')){
    populateHistory(); //populate list with progression history
}

function populateHistory(){
    currentStorage = JSON.parse(localStorage.getItem('progressionStorage'));

    // Todo include list population for #HistoryID
    for(i=0;i<currentStorage.length;i++){
        //$('<option/>').text(progression.savename).appendTo(historySelect); // changes savedname if added
    }
}

saveSessionButton.click(function(event){
    progression.userSavedName = $('#savedName').val();
    console.log('current storage', currentStorage);

    currentStorage.push(JSON.parse(JSON.stringify(progression))); // ask if there should be a limit
    //console.log(JSON.stringify(currentStorage));
    localStorage.setItem('progressionStorage', JSON.stringify(currentStorage));
});

historySelect.change(function(event){
    //var returnPosition = $('option:selected',this).index();
    // returnPosition--;
    // document.getElementById('chord1').value = currentStorage[returnPosition].chord1.name;
    // document.getElementById('chord2').value = currentStorage[returnPosition].chord2.name;
    // suggestChord(currentStorage[returnPosition].chord2.name, currentStorage[returnPosition].chord2.name, currentStorage[returnPosition].chord2.name);

    //console.log(returnPosition);
})


// use this to send emails from within our app :)
function ContactFunction(){
    var templateParams = {
        from_username: credentials.username, 
        from_name: $('.contactName').val(),
        // to_name: 'Cinco Swim',
        from_email: $('.contactEmail').val(),
        message: $('.contactMessage').val() // replace null with question/comment
    };
     
    emailjs.send('service_eqwugke', 'template_f09vmub', templateParams)
        .then(function(response) {
           console.log('SUCCESS!', response.status, response.text);
        }, function(error) {
           console.log('FAILED...', error);
        });
}