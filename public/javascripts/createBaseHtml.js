function createResponseHtml() {
    return (
        `<!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
                <meta name="description" content="">
                <meta name="author" content="">

                <title>Starter Template for Bootstrap</title>

                <!-- Bootstrap core CSS -->
                <link type="text/css" href="/stylesheets/bootstrap.min.css" rel="stylesheet">

                <!-- Custom styles for this template -->
                <link type="text/css" href="/stylesheets/starter-template.css" rel="stylesheet">
            </head>

            <body>

                <nav class="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
                <a class="navbar-brand" href="../../">Market Analyser</a>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarsExampleDefault">
                    <ul class="navbar-nav mr-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="../../">Home</a>
                    </li>
                    </ul>
                    <form class="form-inline my-2 my-lg-0">
                    <input class="form-control mr-sm-2" type="text" placeholder="Search" aria-label="Search">
                    <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
                    </form>
                </div>
                </nav>

                <main role="main" class="container">

                    <div class="starter-template">
                        <h1>ANALYSIS</h1>
                    </div>

                    <div> `
    )
}; 

module.exports = createResponseHtml;