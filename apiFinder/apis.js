// user these later
var entries = 'https://api.publicapis.org/entries'
fetch(entries)
  .then(response => response.json())
  .then(data => {
    entries = data.entries
  })
// get list of available categories
var apiCategories = 'https://api.publicapis.org/categories'
var categories = []
fetch(apiCategories)
  .then(response => response.json())
  .then(data => {
    categories = data.categories
    for (var i=0;i<categories.length;i++){
        $('<option/>').val(categories[i]).html(categories[i]).appendTo('#category');
    }
  })
// when use selects a category, populate container div with associated entries
var filteredEntries = []
$( "#category" ).change(function() {
    var cat = $("#category option:selected").text()
    for(i=0;i<entries.length;i++){
        if(entries[i].Category === cat){
            var api = entries[i].API
            var description = entries[i].Description
            // might want these later
            // var auth = entries[i].Auth
            // var secure = entries[i].HTTPS
            var link = entries[i].Link
            $( `<p><a href="${link}" target=_blank>${api}:</a> ${description} </p>` ).appendTo( ".container" );
            filteredEntries.push(entries[i])
        }
    }
});