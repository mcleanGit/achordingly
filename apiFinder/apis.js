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
$( "#category" ).change(function() {
    // clear the contents of the container div each time this function is called
    $('.container').empty()
    // get the category that the user selected
    var cat = $("#category option:selected").text()
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
            $( `<p><a href="${link}" target=_blank>${api}:</a> ${description} </p>` ).appendTo( ".container" );
            filteredEntries.push(entries[i])
        }
    }
});