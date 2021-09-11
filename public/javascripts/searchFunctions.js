//Process search using navigation bar search box
function navSearch() {
    window.location.pathname = 'search/' + document.getElementById("search").value;
}

//Proces search using home page search box
function homeSearch() {
    window.location.pathname = 'search/' + document.getElementById("searchHome").value;
}

//Push users to a clicked related stock
function pushStock(symbol) {
    //Set window location to clicked stock's page
    window.location.href = symbol;
}
