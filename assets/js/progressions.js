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
        }
    }).catch(function (err) {
    
        // Log any errors
        console.log('something went wrong', err);
    
    })
}