//Fetch the current search string and push to relevant page
function myFunction() {
    //If searching from a current stock search page, just change the symbol
    if (window.location.href.includes('search')) {
        window.location.href = document.getElementById("search").value;
    }
    //Else if searching from the home page add the search keyword and the symbol
    else {
        window.location.href = 'search/' + document.getElementById("search").value;
    }
}