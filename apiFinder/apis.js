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
var cat;
function populate(filter){
    if(filter){
        if(filter === 'none'){
            filter = ''
        }
        // clear the contents of the container div each time this function is called
        $('.container').empty()

        for(i=0;i<entries.length;i++){
            // whenever an api matches the user-chosen category...
            if(entries[i].Category === cat && entries[i].Auth === filter){
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
            }
        }
    } else {
        // clear the contents of the container div each time this function is called
        $('.container').empty()
        $('#auth').remove()

        auths.length = 0
        // add filter menus 
        $('.demo').append('<select name="auth" id="auth"><option disabled selected>Please select authorization</option><option>Reset</option>')
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
                var thisAuth = entries[i].Auth
                if(thisAuth === ''){
                    thisAuth = 'none'
                }
                if(!auths.includes(thisAuth)){
                    auths.push(thisAuth)
                }
            }
        }
        for(i=0;i<auths.length;i++){
            
            $('<option/>').val(auths[i]).html(auths[i]).appendTo('#auth');
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

$( ".demo" ).change(function(event) {
    console.log(event.target)
    switch(event.target.name){
        case 'auth':
            auth = $("#auth option:selected").text()
            if(auth === 'Reset'){
                populate()
            } else {
                populate(auth)
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
    
