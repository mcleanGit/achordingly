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
        // body: JSON.stringify(credentials),
        // headers: {
        //     'Content-Type': 'application/json',
        //     'Accept': 'application/json',
        //     'Authorization': 'Bearer ' + sessionAuth.activkey,
        //     'Access-Control-Allow-Origin':'*'
        // }

function nextChord(childPath){
    // var url = 'https://api.hooktheory.com/v1/trends/nodes?cp=' + childPath
    var url = `https://chriscastle.com/proxy/hooktheory.php?cp=${childPath}&bearer=${sessionAuth.activkey}&nodes`
    console.log('url', url)
    console.log('Bearer ' + sessionAuth.activkey)
    // request a probable chord given first chord degree
    fetch(url,{
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    })
    .then(function (resp) {
        console.log('resp', resp)
        // Return the response as JSON
        return resp.json();

    }).then(function (data) {

        console.log('final', data)
    }).catch(function (err) {

        // Log any errors
        console.log('something went wrong', err);

    })
}
