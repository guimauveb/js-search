/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * At the first char input we fetch JSON data from the server containing everything we want our user to      *
 * search into. Every time the user enters / delete a char, it looks for the query into the JSON data and    *
 * returns results found as a list. I use it to search into articles and projects on my blog.                *  
 * For instance an article has the following structure:                                                      *
 * [                                                                                                         *
 *       {                                                                                                   *
 *           "id": "1",                                                                                      *
 *           "title": "My article title",                                                                    *
 *           "date": "September 05, 2020",                                                                   *
 *           "preview": "Lorem ipsum...",                                                                    *
 *           "link": "/my-great-article",                                                                    *
 *           "tags": ["tag", "tag"]                                                                          *
 *       }                                                                                                   *
 * ]                                                                                                         *
 *                                                                                                           *
 * The JSON object is stored locally after the firt query so all searches are performed without having to    *
 * make multiple GET / POST requests to the server.                                                          * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var search = {};
(function () {
    /* Generate the HTML containing the matches */
    this.listMatches = function(res) {
        var html = '';
        for (var i = 0; i < res.length; i++) {
            var item = res[i];
            item.preview = item.preview.slice(0, 200);
            html +=
                '<div class="modal-search-result" id="item-' + item.id + '">' +
                '<a class="modal-search-link" href="/items/' + item.link +'">' +
                '<div class="modal-search-title">' + item.title + '</div>' +
                '</a>' +
                '<a class="modal-search-link" href="/items/' + item.link + '">' +
                '<div class="modal-search-preview">' + item.preview + '...</div>' +
                '</a>' +
                '<div class="modal-search-tags">';
            for (var j = 0; j < item.tags.length; ++j) {
                html += '<a href="/tags/' + item.tags[j] + '"class="tag-link ' + item.tags[j] + '">' + item.tags[j] + '</a>';
            }

            if (item.date == undefined) {
                item.date = "";
            }

            html += 
                '</div>' +
                '<div class="modal-search-date">' + item.date + '</div>' +
                '</div>'
        }
        return html;
    };

    /* Create the markup when no search is made */
    this.emptyResults = function() {
        return '<div class="empty-results"></div>';
    }

    /* Create the markup when no results are found */
    this.createNoResultsHTML = function(kind) {
        return '<p>No matching ' + kind + ' found</p></div>'
    };

    /* Create the markup when results are found */
    this.createResultsHTML = function(matches, kind) {
        if (matches.length > 1) {
            kind += 's';
        }
        var html = '<p>Found ' + matches.length + ' matching ' + kind + '</p>';
        html += search.listMatches(matches);
        return html;
    };

    /* Check if the query is empty */
    const isEmpty = str => !str.trim().length;
    /* Check if the query is one char long */
    const isOneChar = str => str.length == 1 ? true : false;

    /* Search for matches and call the appropriate function that should return an empty div in the case of an
     * empty query (typically a query made of only spaces) or a 'no results found' message or the actual matches
     */
    /* json is the source in which we'll perform our search */
    this.genResults = function (json, kind, query) {
        /* Make sure the query is not empty and greater than one char */
        if (isEmpty(query) | isOneChar(query)) {
            return this.emptyResults();
        }
        else {
            var matches = [];

            for (var i = 0; i < json.length; i++) {
                var item = json[i];
                /* Merge parts of the JSON objects that will be used to search for keywords */
                var targetblock = item.title + item.preview + item.tags;

                /* Convert targetblock and user query to lowercase to make the search case insensitive */
                targetblock = targetblock.toLowerCase();
                query = query.toLowerCase();

                /* Split the query in multiple tokens */
                var tokens = query.split(" ");

                /* If the query is made of more than one word, search matches for each token it contains */
                if (tokens.length > 1) {
                    var done = 0;
                    for (var t = 0; t < tokens.length; t++) {
                        /* Check if each token is present in the whole block of text */
                        if (targetblock.indexOf(tokens[t]) !== -1) {
                            done++;
                        }
                    }
                    /* If done === tokens.length it means that for every token a match was found in the block */
                    if (done === tokens.length) {
                        matches.push(item);
                    }

                } else {
                    if (targetblock.indexOf(query) !== -1) {
                        matches.push(item);
                    }
                }
            }
        }
        /* Check results size */
        if (matches.length !== 0) {
            return this.createResultsHTML(matches, kind);
        } else {
            return this.createNoResultsHTML(kind);
        }
    }

    /* Our search input field */
    var input = document.getElementById('modal-search-field');
    /* The <div> in which results will be updated */
    var resContent = document.getElementById('modal-search-results')
    /* Set to true when a search has been made so we don't have to fetch the data everytime the user inputs 
     * a char */
    var q = false;

    /* Perform the search everytime the user inputs a key */
    input.onkeyup = async function() {
        var json;
        var query = input.value;
        /* fetch() only once then parse locally the JSON containing all our items */
        if (!q) {
            const resArt = await fetch("/articlesJSON", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            articles = await resArt.json();

            const resProj = await fetch("/projectsJSON", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            projects = await resProj.json();

            q = true;
        }
        resContent.innerHTML = search.genResults(articles, "article", query);
        resContent.innerHTML += search.genResults(projects, "project", query);

    };
}).apply(search);

