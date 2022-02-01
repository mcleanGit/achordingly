// store all entries for use later on
var entries = 'https://api.publicapis.org/entries'
fetch(entries)
    .then(response => response.json())
    .then(data => {
        // overwrite the entries variable with the array of returned apis
        entries = data.entries
    })

// get list of available categories
var categories = 'https://api.publicapis.org/categories'
fetch(categories)
  .then(response => response.json())
  .then(data => {
    categories = data.categories
    // populate the selection menu with each category as an item
    for (var i=0;i<categories.length;i++){
        $('<option/>').val(categories[i]).html(categories[i]).appendTo('#category');
    }
  })
// when user selects a category, populate container div with associated entries
var filteredEntries = []
var auths = []
var httpOpt = []
var cors = []
var cat;
function populate(filter){
    if(filter){
        console.log(filterOpts)
        // if(filter === 'none'){
        //     filter = ''
        // }
        // clear the contents of the container div each time this function is called
        $('.container').empty()
        var accepted = false
        for(i=0;i<entries.length;i++){
            var entry = entries[i]
            // whenever an api matches the user-chosen category...
            if(entry.Category === cat){
                // check filters
                // auth?
                if(filterOpts.auth != false && filterOpts.auth === entry.Auth){
                    accepted = true
                } 
                // http?
                if(filterOpts.http != null && filterOpts.http === entry.HTTPS){
                    accepted = true
                    console.log('flagg')
                } 
                // cors?
                if(filterOpts.cors != false && filterOpts.cors === entry.Cors){
                    accepted = true
                }

                if (accepted === true){
                    var api = entries[i].API
                    var description = entries[i].Description
                    // might want these later
                    // var auth = entries[i].Auth
                    // var secure = entries[i].HTTPS
                    var link = entries[i].Link
                    // then append the values as html-formatted to the .container div
                    $( `<p data-api="${api}"><a href="${link}" target=_blank>${api}:</a> ${description} </p>` ).appendTo( ".container" );
                    filteredEntries.push(entries[i])
                }

            }
        }
    } else {
        // clear the contents of the container div each time this function is called
        $('.container').empty()
        $('#auth').remove()
        $('#httpOpt').remove()
        $('#cors').remove()

        auths.length = 0
        cors.length = 0
        httpOpt.length = 0

        // add filter menus 
        $('.demo').append('<select name="auth" id="auth"><option disabled selected>Please select authorization</option><option>Reset</option>')
        $('.demo').append('<select name="httpOpt" id="httpOpt"><option disabled selected>Please select HTTP/S</option><option>Reset</option>')
        $('.demo').append('<select name="cors" id="cors"><option disabled selected>Please select CORS choice</option><option>Reset</option>')
        // $('<select>').html('name="auth" id="auth"><option disabled selected>Please select authorization</option>').appendTo('#demo');
        // get the category that the user selected
        cat = $("#category option:selected").text()
        // loop through all of the apis
        for(i=0;i<entries.length;i++){
            // whenever an api matches the user-chosen category...
            if(entries[i].Category === cat){
                // get each value 
                var api = entries[i].API
                var description = entries[i].Description
                // might want these later
                // var auth = entries[i].Auth
                // var secure = entries[i].HTTPS
                var link = entries[i].Link
                // then append the values as html-formatted to the .container div
                $( `<p data-api="${api}"><a href="${link}" target=_blank>${api}:</a> ${description} </p>` ).appendTo( ".container" );
                filteredEntries.push(entries[i])

                console.log()
                // get auth option
                var thisAuth = entries[i].Auth
                if(thisAuth === ''){
                    thisAuth = 'none'
                }
                if(!auths.includes(thisAuth)){
                    auths.push(thisAuth)
                }
                // get http/s option
                var httpO = entries[i].HTTPS
                if(!httpOpt.includes(httpO)){
                    httpOpt.push(httpO)
                }
                // get cors option
                var corsOpt = entries[i].Cors
                if(corsOpt === ''){
                    corsOpt = 'none'
                }
                if(!cors.includes(corsOpt)){
                    cors.push(corsOpt)
                }
            }
        }
        for(i=0;i<auths.length;i++){
            
            $('<option/>').val(auths[i]).html(auths[i]).appendTo('#auth');
        }

        for(i=0;i<httpOpt.length;i++){       
            var bool = httpOpt[i]
            if(bool === true){
                bool = 'Yes'
            }else {
                bool = 'No'
            }
            $('<option/>').val(bool).html(bool).appendTo('#httpOpt');
        }

        for(i=0;i<cors.length;i++){
            
            $('<option/>').val(cors[i]).html(cors[i]).appendTo('#cors');
        }
    }
    
}

$( ".container" ).click(function(event) {
    var apiName = event.target.dataset.api
    for(i=0;i<entries.length;i++){
        if(entries[i].API === apiName){
            console.log(entries[i])
            // getAPI(entries[i].Link)
        }
    }
})

var filterOpts = {
    auth: false,
    http: null,
    cors: false
}

$( ".demo" ).change(function(event) {
    console.log(event.target)
    switch(event.target.name){
        case 'auth':
            opt = $("#auth option:selected").text()
            filterOpts.auth = opt
            if(opt === 'Reset'){
                filterOpts.auth = false
                populate()
            } else {
                populate('filter')
            }
        break
        case 'httpOpt':
            opt = $("#httpOpt option:selected").text()
            if(opt === 'Yes'){
                opt = true
            }else {
                opt = false
            }
            filterOpts.http = opt
            if(opt === 'Reset'){
                filterOpts.http = null
                populate()
            } else {
                populate('filter')
            }
        break
        case 'cors':
            opt = $("#cors option:selected").text()
            filterOpts.cors = opt
            if(opt === 'Reset'){
                filterOpts.cors = false
                populate()
            } else {
                populate('filter')
            }
        break

        case 'category':
            populate()
        break        
    }

})

$('.demo').on('click', '.clear', function (event){
        console.log('ye')
        populate()
        // reset filter selectmenus
        $(".auth").val("Please select authorization").change();
    })
    
