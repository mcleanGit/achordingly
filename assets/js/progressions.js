

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

            // TODO remove Login menu from DOM, or at least hide it. 

            // refresh the page
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
function chord1Diagrams(){
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
}

function chord1Details(justChord1){
    console.log(progression.chord1.name)
    // if sharp/flat chosen, just get the sharp
    if(progression.chord1.name.includes('/')){
        progression.chord1.name = progression.chord1.name.split('/')[1]
    }
    progression.key = progression.chord1.name.split(' ')[0]
    progression.chord1.quality = progression.chord1.name.split(' ')[1]
    console.log('quality', progression.chord1.quality)
    // major or minor
    switch(progression.chord1.quality){
        
        case 'major':
        // case '':
            console.log(progression.chord1.quality)
            progression.keyInfo = Tonal.Key.majorKey(progression.key)

        break;
        case 'minor':
        case 'm':
            progression.keyInfo = Tonal.Key.minorKey(progression.key)

        break;
    }
    if(justChord1 === true){
        // don't update chord 2. justChord1===true means the 3rd column was clicked. 
    } else {
        // clear any suggested chord2 content
        clearChord2()
        // chord column number here is 2, scale degree, chord name
        nextChord(2, progression.chord1.degree, progression.chord1.name)
    }

}
// given chord choices in the dropdown of either column 1 or column 2:
$( ".chordSetup" ).change(function(event) {
    switch(event.target.name){
        case 'chord1':
            progression.chord1.name = $("#chord1 option:selected").text()
            progression.chord1.chordID = $("#chord1 option:selected").val()
            chord1Details()
            chord1Diagrams()
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
    // get values of chord 2 drop down first
    progression.chord1.name = $("#chord2 option:selected").text()
    progression.chord1.chordID = $("#chord2 option:selected").val()
    // send it to chord1, with additional var that tells chord1 not to fetch chord2. 
    // chord2Details()
    chord1Diagrams()
    // with true, it skips calling nextChord() on chord 2
    chord1Details(true)
    // set chord 1 dropdown item
    $('<option/>').val(progression.chord1.chordID).html(progression.chord1.name).appendTo('#chord1');
    // make it selected
    $('#chord1').val(progression.chord1.chordID);

    progression.chord2.chordID = event.target.dataset.chordid

    progression.chord2.name = event.target.dataset.chord

    // to do: figure out how to get the chord quality from chord1.name, then add it to chord1.quality here. 
    // needs to reset the chord in column 1

    // add chord to menu, make it selected
    $('<option/>').val(progression.chord2.chordID).html(event.target.dataset.chord).appendTo('#chord2');
    // make it selected
    $('#chord2').val(progression.chord2.chordID);

    // remove diagrams from container
    $( ".chord2DiagramContainer" ).empty();
    // add/re-add the div diagrams in the DOM
    $(".chord2DiagramContainer").append(`<div class="chord2fretboard scales_chords_api" chord="${progression.chord2.name}"></div>`)
    $(".chord2DiagramContainer").append(`<div class="chord2fretboardSound scales_chords_api" chord="${progression.chord2.name}" output="sound"></div>`)
    $(".chord2DiagramContainer").append(`<div class="chord2piano scales_chords_api" instrument="piano"  chord="${progression.chord2.name}"></div>`)
    $(".chord2DiagramContainer").append(`<div class="chord2pianoSound scales_chords_api" instrument="piano" chord="${progression.chord2.name}" output="sound"></div>`)
    // update diagrams
    diagram(".chord2fretboard", event.target.dataset.chord)
    diagram(".chord2piano", event.target.dataset.chord)
    diagram(".chord2fretboardSound", event.target.dataset.chord)
    diagram(".chord2pianoSound", event.target.dataset.chord)

    nextChord(3, progression.chord2.chordID, event.target.dataset.chord)

})
function nextChord(chordNumber, degree, name){
    console.log(chordNumber, degree, name)
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

// Save Session History
var saveSessionButton = $("#SaveSession"); 
var currentStorage = [null]; // index 0 set to null for handling purposes
var historySelect = $('#HistoryID');

// checks local storage for previously saved sessions
if(localStorage.getItem('progressionStorage')){ 

    // assigns array with prior session
    currentStorage = JSON.parse(localStorage.getItem('progressionStorage')); 
    //populates list with session history
    populateHistory(); 
}

function populateHistory(){

    // List population for dropdown with #HistoryID
    for(i=1;i<(currentStorage.length);i++){
        var tempName = currentStorage[i].userSavedName;
        $('<option/>').val(tempName).html(currentStorage[i].userSavedName).appendTo('#HistoryID');
    }
}

// Saving new session button
saveSessionButton.click(function(event){
    
    // assigns users assigned name to saved progression object
    progression.userSavedName = $('#savedName').val(); 

    // array of suggestions from column 3
    var arrayCol3 = [];
    $('#chordListColumn3 li').each(function(){
        arrayCol3.push($(this).text())
    });
    progression.mostCommonAfter2.chords = arrayCol3;
    //console.log('col 3',progression.mostCommonAfter2.chords);

    // assigns chord 1 with name of suggested chord
    progression.chord1.name = $('#chord1 option:selected').text();
    //console.log($('#chord1 option:selected').text());

    // adds new instance of progression to current session array
    currentStorage.push(JSON.parse(JSON.stringify(progression))); 

    // adds session to dropdown
    $('<option/>').val(progression.userSavedName).html(progression.userSavedName).appendTo('#HistoryID');
    
    // updates localstorage with new array of saved sessions
    localStorage.setItem('progressionStorage', JSON.stringify(currentStorage));
});

// Selecting item from saved sessions dropdown
historySelect.change(function(event){

    // obtains which prior session selected, index of dropdown is equal to array as index 0 of both is unselectable/null
    var returnPosition = $('option:selected',this).index();

    // test to see if selections is returning correct session
    //console.log(currentStorage[returnPosition].chord1.name,currentStorage[returnPosition].chord2.name);

    // assigns progression object the values of saved session
    progression = JSON.parse(JSON.stringify(currentStorage[returnPosition]))
    
    console.log(progression)
    // check if chord exists in base list
    var valuecheck = progression.chord1.name.replace(/\s+/g,"_");

    if($('#chord1 option[value=' + valuecheck + ']').length > 0){
        
        //select chord 1 from base values
        $('#chord1').val(valuecheck);

    } else {
        // adds chord if not included in base options
        $('<option/>').val(valuecheck).html(valuecheck).appendTo('#chord1');
        $('#chord1').val(valuecheck);
    }

    console.log(progression.chord1.name, progression.chord2.name)
    // clears chord 2
    clearChord2();

    // remove diagrams from container
    $( ".chord1DiagramContainer" ).empty();
    
    // add/re-add the div diagrams in the DOM
    $(".chord1DiagramContainer").append(`<div class="chord1fretboard scales_chords_api" chord="${progression.chord1.name}"></div>`)
    $(".chord1DiagramContainer").append(`<div class="chord1fretboardSound scales_chords_api" chord="${progression.chord1.name}" output="sound"></div>`)
    $(".chord1DiagramContainer").append(`<div class="chord1piano scales_chords_api" instrument="piano"  chord="${progression.chord1.name}"></div>`)
    $(".chord1DiagramContainer").append(`<div class="chord1pianoSound scales_chords_api" instrument="piano" chord="${progression.chord1.name}" output="sound"></div>`)
    
    // update diagrams
    diagram(".chord1fretboard", progression.chord1.name)
    diagram(".chord1piano", progression.chord1.name)
    diagram(".chord1fretboardSound", progression.chord1.name)
    diagram(".chord1pianoSound", progression.chord1.name)

    // updates chord 2
    //nextChord(2, progression.chord1.degree, progression.chord1.name);

    // Select Chord 2 from history    
    $('<option/>').val(progression.chord2.chordID).html(progression.chord2.name).appendTo('#chord2');
    $('#chord2').val(progression.chord2.chordID);

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

    // column 3 suggestions
    //nextChord(3,progression.chord2.degree,progression.chord2.name);
    $('.chordListColumn3').empty();
    for(i=0; i < progression.mostCommonAfter2.chords.length;i++){
    $('<li/>').html(progression.mostCommonAfter2.chords[i]).appendTo('#chordListColumn3');
    }


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
