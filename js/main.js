// Years
const OLDEST_YEAR = 2018;
const CURRENT_YEAR = parseInt(new Date().getFullYear());
const DEFAULT_YEAR = 2024;
const NUM_YEARS_TO_SHOW = 5;

// Selectors
let SELECTED_YEAR = DEFAULT_YEAR; // Default year to show (OLDEST_YEAR <= SELECTED_YEAR <= CURRENT_YEAR)
let SELECTED_LIST = "Favorite Albums"; // Default list to show ("Favorite Albums" or "Favorite Songs")
let SELECTED_LAYOUT = "GRID"; // Default layout to show ("GRID" or "TABLE")

// Table headers
const ALBUMS_CSV_HEADERS = ["Album", "Artist", "Genre", "Release Date", "Listened On", "Favorite Songs", "Rating", "Hidden Ranking"]; // Everything in my CSV
const SHOWN_ALBUM_HEADERS = ["Album", "Artist", "Genre", "Favorite Songs"]; // Everything shown on the website

const SONGS_CSV_HEADERS = ["Song", "Album", "Artist", "Genre", "Hidden Ranking"]; // Everything in my CSV
const SHOWN_SONG_HEADERS = ["Song", "Artist", "Album", "Genre"]; // Everything shown on the website

const SORTABLE_HEADERS = [""]; // Potentially add the feature to sort the tables in the future, skeleton for this is in place
const SHOW_RATING = SHOWN_ALBUM_HEADERS.includes("Rating"); // Don't plan on ever showing ratings, but keeping this just in case

// Grid layout
let NUM_ALBUMS_PER_ROW = 5; // Updated when window is loaded
let IMAGE_SIZE = 200; // Size of the album art images that are shown in grid form

// Set to true to allow the grid elements to be recreated on load
let RECREATE_GRIDS = false;

// Spotify playlist links (note not all years/lists combos have playlists)
const PLAYLIST_LINKS = {
    "Albums 2024" : "https://open.spotify.com/playlist/0MATwTyjzRLJT9rhMKwM6S?si=5e28ec4d25564422",
    "Songs 2024" : "https://open.spotify.com/playlist/7nzU9D67SJdgd41dLbRwcf?si=18384ce1a1d54f9d",
    "Albums 2023" : "https://open.spotify.com/playlist/01jDUCJ4Z4c2No5bijVJKw?si=2e76605284f64e8e",
    "Songs 2023" : "https://open.spotify.com/playlist/4SLr4bfpWLHQGyQzKonxjE?si=35409659241941f0",
    "Albums 2022" : "https://open.spotify.com/playlist/7jwCBOFBCl1BrwmkPrPLBr?si=099649841fa54b03",
    "Songs 2022" : "https://open.spotify.com/playlist/1JGn9zna2lNdGRklbuOlUX?si=eea92f25e4d44292",
    "Albums 2021" : "https://open.spotify.com/playlist/0T0mqDU2EjiHQaDFIJm79V?si=ff7af6c9a10449a9",
    "Songs 2021" : "",
    "Albums 2020" : "https://open.spotify.com/playlist/3UXyXqHD527llczssqr3TK?si=6a27492ae6ec4ad1",
    "Songs 2020" : "",
    "Albums 2019" : "https://open.spotify.com/playlist/3v253ZQ652keRJmdDJy0Sb?si=edfb8d65f1c342b1",
    "Songs 2019" : "",
    "Albums 2018" : "https://open.spotify.com/playlist/2khHeRdQA4tF096H1LNX08?si=f7691f6956294331",
    "Songs 2018" : "",
}


/************************
**** GENERAL HELPERS ****
************************/
/**
 * Check if a given file exists.
 * @param {*} filename The filename to check the existence for
 * @returns A response object of the fetched filename
 */
async function checkFileExists(filename) {
    // Will cause an error in the console, but nothing breaks so it's okay
    return fetch(filename, { method: 'HEAD' })
        .then(response => response.ok)
        .catch(() => false);
}


/**
 * Takes in the list type clicked on, and converts it into a filename extension for CSVs.
 * NOTE: This is NOT an "extension" as in ".csv", but rather an extension to the filename as in a string to be appended to the filename.
 * @param {*} listType The currently selected list type (e.g. "Favorite Albums" or "Favorite Songs")
 * @returns A string of the filename extension to use
 */
function getExtensionFromList(listType) {
    let extension = "";
    if (listType == "Favorite Albums")
        extension = "";
    else if (listType == "Favorite Songs")
        extension = "_songs";

    return extension
}


/**
 * Determines if the passed in year/list combination is valid (AKA it has a CSV file associated with it)
 * @param {*} list Which list to test if the CSV exists for ("Favorite Albums" or "Favorite Songs")
 * @param {*} year Which year to test if the CSV exists for
 */
async function isValidListYearCombo(list, year) {
    let extension = getExtensionFromList(list);
    let filename = "csv/" + year + extension + ".csv";

    let exists = await checkFileExists(filename);
    if (!exists) {
        console.log("ERROR: " + filename + " does not exist");
        return false;
    }

    return true;
}


/**
 * Highlight an HTML row as gold, silver, or bronze if the rating is high enough.
 * @param {*} row The HTML row to potentially highligh
 * @param {*} rating The album's rating used to determine if highlighting is needed
 */
function highlightElementFromRating(elem, rating) {
    if (parseInt(rating) == 10) { // For now, 10s are handled the exact same way as golds, so this doesn't really do anything
        elem.classList.add("ten");
    }
    else if (parseInt(rating) >= 9) {
        elem.classList.add("gold");
    }
    else if (parseInt(rating) >= 8) {
        elem.classList.add("silver");
    }
    else if (parseInt(rating) >= 7) {
        elem.classList.add("bronze");
    }
}


/**
 * Sleeps, and then returns.
 * @param {*} ms Number of milliseconds to sleep.
 * @returns Promise indicating the sleep is done.
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/**
 * Given a rating value, uses the global variables to decide if that album should be shown or not.
 * @param {*} rating The numberical value (out of 10) of the rating of the album to show or not.
 * @returns Boolean of whether to show the album or not.
 */
function shouldShowAlbum(rating) {
    // Current settings:
    // If showing the ratings, then show everything
    // Otherwise, only show albums at or above 6.5 ratings
    if (!SHOW_RATING) {
        if (rating != "" && parseFloat(rating) < 6.5) {
            return false;
        }
    }

    return true;
}


/********************************
**** STARTUP / ON LOADING IN ****
********************************/
/**
 * Gets the current parameter specified by 'param' in the website URL
 * @param {*} param Parameter to get from the URL
 * @returns String of the value assigned to the parameter (or null if it does not exist)
 */
function getQueryParam(param) {
    let urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}


/**
 * Function that runs when the website it first loaded in. Sets up the initial view of the website
 */
document.addEventListener("DOMContentLoaded", async function() {
    // Preload all the images by created a grid for each year
    setGridAlbumsPerRow();
    
    // UNCOMMENT TO RECREATE ALL THE GRIDS TO COPY OVER INTO INDEX.HTML
    if (RECREATE_GRIDS) {
        createAllGrids();
    }

    // Get the parameters to load from the URL (or the get the defaults otherwise)
    let listQuery = getQueryParam("list");
    let yearQuery = getQueryParam("year");
    let layoutQuery = getQueryParam("layout");

    SELECTED_LIST = listQuery ? (listQuery == "albums" ? "Favorite Albums" : "Favorite Songs") : "Favorite Albums";
    SELECTED_YEAR = yearQuery ? yearQuery : SELECTED_YEAR;
    SELECTED_LAYOUT = layoutQuery ? layoutQuery.toUpperCase() : SELECTED_LAYOUT;

    // If the parameters are not valid (there is not list for that year/list combination), then use defaults
    if (!await isValidListYearCombo(SELECTED_LIST, SELECTED_YEAR)) {
        showAlertBanner("\"" + listType + "\" list does not exist for " + SELECTED_YEAR);
        SELECTED_LIST = "Favorite Albums";
        SELECTED_YEAR = DEFAULT_YEAR;
        SELECTED_LAYOUT = "GRID";
    }

    // Update the current layout design
    updateDisplay();

    // Update the Year Selector navbar to display the correct list being selected (since the navbar is not part of the "display" area)
    updateYearsShownInList(SELECTED_YEAR);
    grayOutMissingYears();
    updateYearIncDecButtons();

    // Update the favicon depending on light/dark mode (unreliable)
    let favicon = document.getElementById("favicon");
    let darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    if (darkModeMediaQuery.matches) {
        favicon.href = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAADoUlEQVR4nO2aW29MURTHT4iSuDSkiAc8ShAfQeLa0tQb5YEXL6Q3fAUPqg8axINXX0C1yjeQNjzpVStKi3Y6+/+f4zRRim5Z7Elq7Lmcs8/MoelKVjKZOWft/dtr7XXWWXs8b0WWqZCsJtlAsgNAD8kRAGmS86Lm8zCAbpI35Vql1CbvXxCtdRWAcySfAPhOUodRAN9I9gI4K7a8SsvExMS6TCZzheRU2MkXULHVqrVeWxEIALUAxmMEyNVXSqljZQOQlQJwu4wAuXo/du/Mzc1tA/C8ghDaaF8QBFtjgSC5G8BYAhA6G2oyBycIWQ2SowlCaFEAr2dmZra77IkkwkmT9C3f9UfaMwDuJbT6L3zf3wzggeW3O2EhahOCeDs7O7tD5iAwuZ4BsFhyahb3JbQvPpE8IHMQGPFMHtgxeSAXBTFP7Ep74msmkzlkomEfyXdF7mkp5o01JRiJG2KR5AWziIcBZEq4b6pgbWYKwEqH1C0Zm+R58UyIBWjMC0LyaUyTe0myTcJkenp6vagJmTaSAznXfhQY4xkdQh/ng6g2ZbVLmHwheVlrvapA+K4m2RRm9WkfayGdTm+0gZxyhchu2FLE7AcnGJL1NpAOR5BLpUIsGbPZEaT9L6Pm9TTynigUTkXCbNBh8R7ZVsflIdjmRRSl1FWHcYdtHpmNalAptdc2SYlhku8l7wM4YbsGwH4Hj6Rsg85HNWjNHr9tLn2nn7RdI/c6eOTz8gVBGUJLwsnATAKoq1RojfyHm33ItjLdDgYHJJVGTL9DDh7psnnkpgOIaFNYEGnIOY55w2a0IYZ3iiOlQiiljkq95DjmyXIVjVI7NRcKMxNOrTFALOTLlgLTG9LYDwDXAbzJ+W1QNrFkpFQqtUFUPgO45rIn+OfYPXndLV3xEMbkqOC0ua8zjskxHMgZ51ddACB50MT6xUpDkJwsegxRLJNI1y+dTu8xnqhz3Vdly5Ba66oClXB/tnVpnsh+AiE1VnLHUSl13GIgJZvWQOwk+SEBiMUwKf6XSHvSYuiu7/tbLA2ESoF0hoJY0nHssxhjEhAkn0U+ZwyCoMaxmIzLE+Ny2OS5iByymMOWpEBGSe5ygsg58OlPIpyCIKjx4hTzsGyP0BF0OQyt8solcj5R5lAbCZ1io4rJaC1SKsQIIKVRcyL/gDB/4WiUhnKUUkVKcalipQBMBKBAN6Te7KMu8wealHQ6RM1n+e6hvNnJtdlKYUWWo/wEMpHbC2795DwAAAAASUVORK5CYII=";
    }
});


/*************************
**** GENERAL UPDATERS ****
*************************/
/**
 * Updates the visuals of the lyaout button, depending on the selected list and layout
 */
function updateLayoutButton() {
    let layout_button =  document.getElementById("layout-button");

    // Remove the layout button for the songs list
    (SELECTED_LIST == "Favorite Songs") ? layout_button.classList.add("hidden") : layout_button.classList.remove("hidden");

    // Update the icon to match the layout
    (SELECTED_LAYOUT == "TABLE") ? layout_button.classList.replace("fa-bars", "fa-grid-2") : layout_button.classList.replace("fa-grid-2", "fa-bars");
}


/**
 * Updates the text and link to the spotify playlist above the table.
 */
function updateSpotifyPlaylist() {
    let playlistLink = document.getElementById("playlist-link");

    // If in a search list, remove the spotify playlist
    if (SELECTED_LIST == "Search") {
        playlistLink.parentElement.classList.add("hidden");
        playlistLink.parentElement.parentElement.style.minHeight = "42.19px";
        return;
    }
    playlistLink.parentElement.classList.remove("hidden");
    playlistLink.parentElement.parentElement.style.minHeight = "0px";

    // Update the text / name of the playlist
    let playlistName = (SELECTED_LIST == "Favorite Albums") ? "Albums " : "Songs ";
    playlistName += String(SELECTED_YEAR)

    playlistLink.innerHTML = playlistName;

    // Update the link to the playlist
    playlistLink.href = PLAYLIST_LINKS[playlistName];
}


/**
 * Updates the website URL with the current list, year, and layout parameters
 */
function updateUrl() {
    // Build the new URL with all the website display info
    let newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + 
                 "?list=" + (SELECTED_LIST == "Favorite Albums" ? "albums" : "songs") + 
                 "&year=" + SELECTED_YEAR +
                 "&layout=" + SELECTED_LAYOUT.toLowerCase();
    
    // If in the search list, use a different URL
    if (SELECTED_LIST == "Search") {
        newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?search=?"
    }
    
    window.history.pushState({ path: newUrl }, '', newUrl);
}


/**
 * Handles when the change layout button is clicked
 */
document.getElementById("layout-button").addEventListener("click", function(event) {
    if (SELECTED_LAYOUT == "TABLE") {
        SELECTED_LAYOUT = "GRID";
    }
    else if (SELECTED_LAYOUT == "GRID"){
        SELECTED_LAYOUT = "TABLE";
    }

    updateDisplay();
});


/**
 * Updates which display (table, grid, search) is shown
 */
function updateShownDisplay() {
    // Special case for searches
    if (SELECTED_LIST == "Search") {
        document.getElementById("table-container").classList.add("hidden");
        document.getElementById("grid-container").classList.add("hidden");
        document.getElementById("search-container").classList.remove("hidden");
        return;
    }

    // Hide the search elements
    document.getElementById("search-input").value = "";
    document.getElementById("search-container").classList.add("hidden");

    // Update the display to match the current year and list, depending on the layout
    if (SELECTED_LAYOUT == "TABLE") {
        document.getElementById("table-container").classList.remove("hidden");
        document.getElementById("grid-container").classList.add("hidden");
    }
    else if (SELECTED_LAYOUT == "GRID") {
        document.getElementById("table-container").classList.add("hidden");
        document.getElementById("grid-container").classList.remove("hidden");
    }
}


/**
 * Updates everything within the main display (which is the album list/grid)
 */
function updateDisplay() {
    // Update the small stuff
    updateLayoutButton();
    updateSpotifyPlaylist();
    updateUrl();
    updateActiveList();
    updateActiveYear();
    updateShownDisplay();

    // If searching, handle it's display separately
    if (SELECTED_LIST == "Search") {
        updateSearch();
    }

    // Otherwise the albums/songs list is being shown
    // So, update the display to match the current year and list, depending on the layout
    else if (SELECTED_LAYOUT == "TABLE") {
        updateTable();
    }
    else if (SELECTED_LAYOUT == "GRID") {
        updateGrid();
    }
}


/*****************************
**** GRID WINDOW RESIZING ****
*****************************/
/**
 * Determines how many albums are displayed per row in the grid layout, depending on the screen width
 */
function setGridAlbumsPerRow() {
    if (window.innerWidth < 600) {
        NUM_ALBUMS_PER_ROW = 2;
        IMAGE_SIZE = 135;
    }
    else if (window.innerWidth < 1500) {
        NUM_ALBUMS_PER_ROW = Math.floor(window.innerWidth / 300);
        IMAGE_SIZE = 200;
    }
    else {
        NUM_ALBUMS_PER_ROW = 5;
        IMAGE_SIZE = 200;
    }
}


/**
 * Adjusts the grid layout whenever the user starts and then stops resizing the window
 */
let resizeTimeout;
window.addEventListener('resize', function() {
    // Clear the timeout every time resize is triggered
    clearTimeout(resizeTimeout);

    // Set a timeout to run after resizing stops (e.g., 200ms delay)
    resizeTimeout = setTimeout(function() {
        if (SELECTED_LAYOUT != "GRID") {
            return;
        }

        // Get how many albums can be shown per row
        let prev = NUM_ALBUMS_PER_ROW;
        setGridAlbumsPerRow();

        // If that value is different from what is currently displayed, update which grid is shown
        if (NUM_ALBUMS_PER_ROW != prev) {
            // If this is the search grid, recreate it. Otherwise, change which grid is displayed
            if (SELECTED_LIST == "Search")
                handleSearch();
            else
                updateGrid();
        }
    }, 200);
});


/*********************
**** GRID SORTING ****
*********************/
/**
 * Sort a list of values in descending order by hidden ranking.
 * @param {*} listToSort The list to sort, where each element is a dictionary with a "Hidden Ranking" value.
 * @returns The sorted list.
 */
function listBubbleSort(listToSort) {
    // It's fine doing a simple bubble sort (performance wise) since n is always small for my tables (number of album entries will never exceed 3 digits)
    for (let i = 0; i < listToSort.length - 1; i++) {
        
        let swapped = false;
        
        for (let j = 0; j < listToSort.length - i - 1; j++) {
            let topRanking = listToSort[j]["Hidden Ranking"];
            let botRanking = listToSort[j + 1]["Hidden Ranking"];

            // Convert to numbers if the column is numeric
            if (!isNaN(topRanking) && !isNaN(botRanking)) {
                topRanking = Number(topRanking);
                botRanking = Number(botRanking);
            }
            
            // Perform the swap depending on if we are in increasing or decreasing order
            if (botRanking > topRanking) {
                let temp = listToSort[j];
                listToSort[j] = listToSort[j + 1];
                listToSort[j + 1] = temp;
                swapped = true;
            }
        }

        if (swapped == false) {
            break;
        }
    }

    return listToSort;
}


/**
 * Converts the album list CSV data into a sorted list of the same CSV data.
 * @param {*} data The CSV data.
 */
function csvToSortedCsvList(data, year) {
    let listToSort = [];
    data.forEach(function(csvRow) {
        // Some previous lists include albums from ANY year. I want to exclude those for now, and only include albums release the selected year
        let releaseDate = Date.parse( csvRow["Release Date"] );
        if (releaseDate < Date.parse("1/1/" + year)) {
            return;
        }

        // If I am not showing the ratings for the albums, only show the albums I would recommend (which are albums above 6 in their score)
        if (!shouldShowAlbum(csvRow["Rating"])) {
            return;
        }

        listToSort.push(csvRow);
    });

    return listBubbleSort(listToSort);
}


/*************************
**** CREATING GRID(S) ****
*************************/
/**
 * Creates a hidden HTML element containing the album grid for each year.
 * Used to "preload" all the grids to make it more responsive to the user.
 */
function createAllGrids() {
    for (let year = OLDEST_YEAR; year <= CURRENT_YEAR; year++) {
        for (let albumsPerRow = 2; albumsPerRow <= 5; albumsPerRow++) {
            createGrid(year, albumsPerRow);
        }
    }
}


/**
 * Converts a CSV row (which represents an album), and turns it into an image element along with supporting info.
 * The result is a single album "grid block."
 * @param {*} csvRow The row of CSV data to convert into an album "grid block."
 * @param {*} workingRow The HTML row to insert the HTML album "grid block" into.
 * @param {*} imageSize Optional param to manually set the image size.
 * @returns The HTML element of the album "grid block" created.
 */
async function csvRowToGridImage(csvRow, workingRow, imageSize = IMAGE_SIZE) {
    let releaseYear = csvRow["Release Date"].slice(-4).toLowerCase();
    let albumName = csvRow["Album"].replace(/[^\p{L}\p{N}]+/gu,"").toLowerCase();
    let artistName = csvRow["Artist"].split(",")[0].replace(/[^\p{L}\p{N}]+/gu,"").toLowerCase();
    let imageFilename = "images/albums/" + releaseYear + "/" + artistName + "_" + albumName + "_" + 300 + ".jpg";

    // Make sure the image exists
    let exists = await checkFileExists(imageFilename);
    if (!exists) {
        console.log("[ERROR] Image does not exist for filename " + imageFilename);
        return;
    }

    // Insert the image
    let cell = workingRow.insertCell();
    cell.classList.add("art-cell");
    cell.innerHTML  = "<img class=\"art-art\" src=\"" + imageFilename + "\" width=\"" + imageSize + "px\" height=\"" + imageSize + "px\">";

    // Insert all the other album info
    cell.innerHTML += "<div class=\"art-album\"><i>" + csvRow["Album"] + "</i></div>";
    cell.innerHTML += "<div class=\"art-artist\"><b>By:</b> <u>" + csvRow["Artist"] + "</u></div>";
    cell.innerHTML += "<div class=\"art-genre\"><b>Genre:</b> " + csvRow["Genre"] + "</div>";
    cell.innerHTML += "<div class=\"art-hidden-ranking hidden\">" + csvRow["Hidden Ranking"] + "</div>";

    return cell;
}


/**
 * Converts a list of CSV rows into an HTML element containing the grid of albums
 * @param {*} csvRowList The CSV list of rows to convert into the grid
 * @param {*} year The year this CSV list is associated with
 * @returns The HTML element containing the grid of albums
 */
async function listToGrid(csvRowList, year, albumsPerRow) {
    // Actually create the grid element
    let newTable = document.createElement('tbody');
    newTable.id = "album-grid-" + year + "-" + albumsPerRow;
    newTable.classList.add("hidden");

    // Convert each list row into an element on the grid
    let index = 0;
    for (let csvRow of csvRowList) {
        // If this is the start of a new row, insert it. Otherwise, get the last row
        let workingRow = (index % albumsPerRow == 0) ? newTable.insertRow(-1) : newTable.rows[newTable.rows.length - 1];
        index = index + 1;

        // Insert the new image grid element
        let newCell = await csvRowToGridImage(csvRow, workingRow, (albumsPerRow == 2) ? 135 : 200);
        
        // Color the element appropriately
        highlightElementFromRating(newCell, csvRow["Rating"]);
    }
    
    return newTable;
}


/**
 * Creates the album grid HTML element for the given year.
 * @param {*} year the year to create the grid for.
 */
async function createGrid(year, albumsPerRow) {
    // Load in the new CSV and display the new data
    let extension = getExtensionFromList("Favorite Albums");
    let filename = "csv/" + year + extension + ".csv";

    d3.csv(filename).then(async function(data) {
        // Create the list of CSV data
        let sortedCsvList = csvToSortedCsvList(data, year);

        // Convert the list into the grid
        let grid = await listToGrid(sortedCsvList, year, albumsPerRow);

        // If this grid already exists, replace it
        (document.getElementById(grid.id)) 
            ? (document.getElementById(grid.id).innerHTML = grid.innerHTML) 
            : document.getElementById("album-grids").appendChild(grid);
    });
}


/*****************************
**** UPDATING GRID LAYOUT ****
*****************************/
/**
 * Hides all the grid elements
 */
function hideAllGrids() {
    for (let year = OLDEST_YEAR; year <= CURRENT_YEAR; year++) {
        for (let albumsPerRow = 2; albumsPerRow <= 5; albumsPerRow++) {
            document.getElementById("album-grid-" + year + "-" + albumsPerRow).classList.add("hidden");
        }
    }
}


/**
 * Updates which grid is visible
 */
function updateGrid() {
    hideAllGrids();
    document.getElementById("album-grid-" + SELECTED_YEAR + "-" + NUM_ALBUMS_PER_ROW).classList.remove("hidden");
}


/***********************
**** CREATING TABLE ****
***********************/
/**
 * Add a list of headers to a passed in HTML table row element.
 * @param {*} row HTML row element to add the header cells to
 * @param {*} headers A list of header strings
 */
function addHeadersToRow(row, headers) {
    headers.forEach(function(header, i) {
        let cell = row.insertCell();
        cell.classList.add(header.replace(" ", "-").toLowerCase());
        cell.innerHTML = "<div class=\"header\">" + header + "</div>";
        
        // Have to do weird wrapping for the order triangle (▲/▼) for reasons I forgot 
        if (SORTABLE_HEADERS.includes(header)) {
            cell.innerHTML = "<div class=\"header\">" + header + "<span id=\"header_" + i + "_order\">▲&#xFE0E;</span> </div>";
            cell.setAttribute("onclick", "sortTable(" + i + ")");
        }
    });
}


/**
 * Transfers all the data in a CSV row object into an HTML row object, and hides the columns not in headersToShow.
 * @param {*} htmlRow The HTML row object that will be populated with the new cells containing the CSV data
 * @param {*} headersToShow The list of column headers you want to include from the CSV data
 * @param {*} csvRow The CSV row object containing the data to transfer
 * @param {*} defaultVal The default value to use if the CSV cell is empty or does not exist (default of "-")
 */
function csvRowToTableRow(htmlRow, headersToShow, csvRow, defaultVal = "-") {
    // Add each piece of info in the CSV to the HTML table
    for (const [key, value] of Object.entries(csvRow)) {
        let cell = htmlRow.insertCell();
        cell.innerHTML = value ? value : defaultVal;

        // Hide all cells in columns I don't care about (but keep the data accessible)
        if (!headersToShow.includes(key)) {
            cell.classList.add("hidden");
        }
    }
}


/**
 * Loads all the data in the passed in CSV into the HTML albums table.
 * @param {*} data 
 */
function csvToTable(data) {
    // Create a new table element so I can do all the replacing at once and prevent flickering
    let newTable = document.createElement('tbody');
    newTable.id = "display-table-body";

    // Loop through each row in the CSV data (which is an album entry), and copy the data into the HTML table
    data.forEach(function(csvRow) {
        // Some previous lists include albums from ANY year
        // I want to exclude those for now, and only include albums release the selected year
        let releaseDate = Date.parse( csvRow["Release Date"] );
        if (releaseDate < Date.parse("1/1/" + SELECTED_YEAR)) {
            return;
        }

        // If I am not showing the ratings for the albums, only show the albums I would recommend (which are albums above 6 in their score)
        if (!shouldShowAlbum(csvRow["Rating"])) {
            return;
        }

        // Insert the new row
        let newRow = newTable.insertRow(-1);

        // Populate the row depending on what list is selected
        if (SELECTED_LIST == "Favorite Albums") {
            csvRowToTableRow(newRow, SHOWN_ALBUM_HEADERS, csvRow);
        }
        else if (SELECTED_LIST == "Favorite Songs") {
            csvRowToTableRow(newRow, SHOWN_SONG_HEADERS, csvRow);
        }

        // Highlight the row gold/silver/bronze if the score is high enough
        highlightElementFromRating(newRow, csvRow["Rating"]);
    });

    // Replace the entire old table with the new table
    let oldTable = document.getElementById("display-table-body");
    oldTable.parentNode.replaceChild(newTable, oldTable);
}


/**********************
**** TABLE SORTING ****
**********************/
/**
 * Make all header order arrows grayed out triangles pointing up EXCEPT the active header.
 * @param {*} activeElement The HTML span element of the active header
 */
function updateOrderTriangles(activeElement) {
    document.querySelectorAll("#list-display #table-headers .header span").forEach(span => {
        // If this is a column NOT being used for sorting, gray out the order triangle and set it pointing up
        if (span != activeElement){
            span.innerHTML = "▲&#xFE0E;";
            span.classList.remove("active");
        }
        // If this is the active element, update the triangle and class
        else {
            (order.innerHTML == "▲&#xFE0E;") ? (order.innerHTML = "▼&#xFE0E;") : (order.innerHTML = "▲&#xFE0E;"); // Flip the triangle
            activeElement.classList.add("active");
        }
    });
}


/**
 * Swaps two adjacent rows in an HTML table.
 * @param {*} topRow Top row (of the two adjacent rows to swap)
 * @param {*} botRow Bottom row (of the two adjacent rows to swap)
 */
function swapAdjacentRows(topRow, botRow) {
    topRow.parentNode.insertBefore(botRow, topRow);
}


/**
 * Perform a bubble sort to order the table by the selected header.
 * @param {*} headerIndex The header/column to order the table by
 * @param {*} order The direction to sort in ("asc" or "desc")
 */
function tableBubbleSort(headerIndex, order) {
    let table = document.getElementById("display-table-body");
    let rows = table.rows;

    // It's fine doing a simple bubble sort (performance wise) since n is always small for my tables (number of album entries will never exceed 3 digits)
    for (let i = 0; i < rows.length - 1; i++) {
        
        let swapped = false;
        
        for (let j = 0; j < rows.length - i - 1; j++) {
            let topCell = rows[j].cells[headerIndex].innerHTML
            let botCell = rows[j + 1].cells[headerIndex].innerHTML

            // Convert to numbers if the column is numeric
            if (!isNaN(topCell) && !isNaN(botCell)) {
                topCell = Number(topCell);
                botCell = Number(botCell);
            }
            
            // Perform the swap depending on if we are in increasing or decreasing order
            if ((order == "desc"  && botCell > topCell) || (order == "asc" && botCell < topCell)) {
                swapAdjacentRows(rows[j], rows[j + 1]);
                swapped = true;
            }
        }

        if (swapped == false) {
            break;
        }
    }
}


/**
 * Sort the albums table by the column corresponding to headerIndex.
 * @param {*} headerIndex Column index to sort by
 */
function sortTable(headerIndex) {
    // The current order the table is sorted by (can be null)
    let order = document.getElementById("header_" + headerIndex + "_order");

    // If it is already sorted by this column, get the current order and do the opposite
    // If it is not sorted (or there is no previous order), default to descending
    if (order == null || order.innerHTML == "▲&#xFE0E;") { // Short circuit if there is no order (i.e. we are doing the default ordering)
        tableBubbleSort(headerIndex, "desc"); // Sort and flip to ▼
    }
    else {
        tableBubbleSort(headerIndex, "asc"); // Sort and flip to ▲
    }

    // Update the visuals of the order triangle(s)
    if (order != null) {
        updateOrderTriangles(order);
    }
}


/******************************
**** UPDATING TABLE LAYOUT ****
******************************/
/**
 * Updates the values of the table headers to match the selected list.
 */
function updateTableHeaders() {
    // Clear the current headers
    let header = document.getElementById("display-headers");
    header.innerHTML = "";

    // Create the new header row
    let newRow = header.insertRow();

    // Populate the new header row depending on the selected list
    if (SELECTED_LIST == "Favorite Songs") {
        addHeadersToRow(newRow, SHOWN_SONG_HEADERS);
    }
    else if (SELECTED_LIST == "Favorite Albums") {
        addHeadersToRow(newRow, SHOWN_ALBUM_HEADERS);
    }
}


/**
 * Uses the SELECTED_YEAR and SELECTED_LIST to update the data in the albums/songs table.
 * This is called on startup, and whenever the list type (albums/songs) or list year is changed.
 */
function updateTable() {
    // Update the table headers to match the selected list
    // This also makes sure there is the appropriate number of columns in the table
    updateTableHeaders();

    // Load in the new CSV and display the new data
    let extension = getExtensionFromList(SELECTED_LIST);
    let filename = "csv/" + SELECTED_YEAR + extension + ".csv";
    d3.csv(filename).then(function(data) {
        csvToTable(data);

        // Sort the data in the table (if needed)
        // NOTE: This WONT WORK if it is pasted after the d3.csv() call, and idk why
        if (SELECTED_LIST == "Favorite Albums") {
            sortTable(ALBUMS_CSV_HEADERS.indexOf("Hidden Ranking"));
        }
    });
}


/*********************
**** ALERT BANNER ****
*********************/
/**
 * Hides the alert message banner
 * (This is only here for the setTimeout function)
 */
function hideAlertBanner() {
    let alert = document.getElementById("alert-banner");
    alert.classList.add("hidden");
}


/**
 * Shows the alert banner with the given message.
 * @param {*} msg The message to display in the alert.
 * @param {*} permanent Optional boolean of if the banner should be permanent (true), or time out after 8 seconds (false - default).
 */
function showAlertBanner(msg, permanent = false) {
    let alertMsg = document.getElementById("alert-msg");
    alertMsg.innerHTML = msg;
    
    let alert = document.getElementById("alert-banner");
    alert.classList.remove("hidden");

    if (!permanent) {
        setTimeout(hideAlertBanner, 8*1000);
    }
}


/******************************
**** YEAR / LIST SELECTORS ****
******************************/
/**
 * Updates what year button is shown as the "active" year.
 */
function updateActiveYear() {
    document.querySelectorAll("#year-list button").forEach(btn => {
        if (btn.innerHTML != SELECTED_YEAR) {
            btn.classList.remove("active");
        }
        else {
            btn.classList.add("active");
        }
    });
}


/**
 * Updates what list is shown as the "active" list.
 */
function updateActiveList() {
    document.querySelectorAll("#list-list button").forEach(btn => {
        if (btn.innerHTML != SELECTED_LIST) {
            btn.classList.remove("active");
        }
        else {
            btn.classList.add("active");
        }
    });
}


/**
 * Updates the table when a new year is selected.
 */
document.getElementById("year-list").addEventListener("click", async function(event) {
    let year = event.target.innerHTML;

    // Prevent bug where the user can click on the table cell the button is inside
    if (year.includes("<button")) {
        return;
    }

    // Set the currently selected year and change the active button
    SELECTED_YEAR = year;
    
    // If the user is coming from a search result, then default back to the albums list
    if (SELECTED_LIST == "Search") {
        SELECTED_LIST = "Favorite Albums";
    } 

    updateDisplay(); 
});


/**
 * Updates the table when a new list (e.g. "Favorite Songs" or "Favorite Albums") is selected.
 */
document.getElementById("list-list").addEventListener("click", async function(event) {
    let listType = event.target.innerHTML;

    // If coming from a search menu, default to the default year
    if (SELECTED_LIST == "Search") {
        SELECTED_YEAR = DEFAULT_YEAR;
    }

    // If a CSV for this year/list does not exist, show an error banner and go back to the default page
    if (!await isValidListYearCombo(listType, SELECTED_YEAR)) {
        showAlertBanner("\"" + listType + "\" list does not exist for " + SELECTED_YEAR);
        SELECTED_YEAR = DEFAULT_YEAR;
        updateYearsShownInList(SELECTED_YEAR);
        // Do not return, instead send the user to the current year (which should have both lists)
    }
    
    // Set the currently selected list and change the active button
    SELECTED_LIST = listType;

    // Default to the grid display for albums, and table display for songs
    if (SELECTED_LIST == "Favorite Albums") {
        SELECTED_LAYOUT = "GRID";
    }
    else if (SELECTED_LIST == "Favorite Songs") {
        SELECTED_LAYOUT = "TABLE";
    }
    
    updateDisplay();
    grayOutMissingYears();
});


/*****************************
**** CHANGING YEARS SHOWN ****
*****************************/
/**
 * Updates if the year-increase and year-decrease buttons are enabled or disabled, depending on what years are being displayed.
 */
function updateYearIncDecButtons() {
    document.getElementById("year-decrease").disabled = (document.getElementById("year1").innerHTML <= OLDEST_YEAR);
    document.getElementById("year-increase").disabled = (document.getElementById("year5").innerHTML >= CURRENT_YEAR);
}


/**
 * Determines which years should be enabled/disabled for the currently shown years.
 */
async function grayOutMissingYears() {
    for (let i = 1; i <= NUM_YEARS_TO_SHOW; i++) {
        let year = document.getElementById("year" + i).innerHTML;

        // Disable/enable each button depending on if a CSV list file exists
        if (await isValidListYearCombo(SELECTED_LIST, year)) {
            document.getElementById("year" + i).disabled = false;
        }
        else {
            document.getElementById("year" + i).disabled = true;
        }
    }
}


/**
 * Increase the years shown by the year-list.
 */
function increaseShownYears() {
    // Don't let the user go into the future
    if (document.getElementById("year5").innerHTML >= CURRENT_YEAR) {
        return;
    }

    // Increase all year numbers
    for (let i = 1; i <= NUM_YEARS_TO_SHOW; i++) {
        let yearElement = document.getElementById("year" + i);
        document.getElementById("year" + i).innerHTML = parseInt(yearElement.innerHTML) + NUM_YEARS_TO_SHOW
    }

    // Update buttons and visuals
    grayOutMissingYears();
    updateActiveYear();
    updateYearIncDecButtons();
}
document.getElementById("year-increase").onclick = function() {
    increaseShownYears()
};


/** 
 * Decrease the years shown by the year-list.
 */
function decreaseShownYears() {
    // Don't let the user go before 2019
    if (document.getElementById("year1").innerHTML <= OLDEST_YEAR) {
        return;
    }

    // Decrease all year numbers
    for (let i = 1; i <= NUM_YEARS_TO_SHOW; i++) {
        let yearElement = document.getElementById("year" + i);
        document.getElementById("year" + i).innerHTML = parseInt(yearElement.innerHTML) - NUM_YEARS_TO_SHOW;
    }
    
    // Update buttons and visuals
    grayOutMissingYears();
    updateActiveYear();
    updateYearIncDecButtons();
}
document.getElementById("year-decrease").onclick = function() {
    decreaseShownYears();
};


/**
 * Will continually update which years are shown in the Year Selector navbar, until they include the target year
 * NOTE: This will not check if a CSV exists for that year or not
 * @param {*} targetYear The year you want to be represented in the year list
 */
function updateYearsShownInList(targetYear) {
    let counter = 0; // Keep counter just in case this continually loop (even though it shouldn't, it did crash my Chrome one time)
    let yearInRange = document.getElementById("year1").innerHTML <= targetYear && targetYear <= document.getElementById("year5").innerHTML;
    while (!yearInRange) {
        if (targetYear < document.getElementById("year1").innerHTML) {
            decreaseShownYears();
        }
        else {
            increaseShownYears();
        }

        yearInRange = document.getElementById("year1").innerHTML <= targetYear && targetYear <= document.getElementById("year5").innerHTML;

        counter++;
        if (counter > 100) {
            break;
        }
    }
}


/*****************************
**** ALBUM GRID SEARCHING ****
*****************************/
/**
 * Formats a given list of album grid square elements into a single tbody element.
 * @param {*} squareList List of album grid square HTML elements.
 * @returns The tbody element with the formatted album grid squares.
 */
function createGridFromHtmlSquareList(squareList) {
    let newTable = document.createElement('tbody');
    newTable.id = "search-results-albums-grid";

    // If the list is less than the NUM_ALBUMS_PER_ROW, must fill the row with empty cells to make the spacing correct
    if (squareList.length < NUM_ALBUMS_PER_ROW) {
        for (let i = squareList.length; i < NUM_ALBUMS_PER_ROW; i++) {
            let td = document.createElement("td");
            td.classList.add("art-cell");
            squareList.push(td);
        }
    }

    // Format the list of squares into the appropriately sized grid
    let index = 0;
    for (let square of squareList) {
        let workingRow = (index % NUM_ALBUMS_PER_ROW == 0) ? newTable.insertRow(-1) : newTable.rows[newTable.rows.length - 1];
        index = index + 1;

        let cell = workingRow.insertCell();
        cell.replaceWith(square);
    }

    return newTable;
}


/**
 * Removes the info text to the square content. (The "By: " and "Genre: " indicators.)
 * @param {*} square The square to remove the text from.
 */
function stripSquareElemContent(square) {
    if (square.classList.contains("art-artist"))
        square.innerHTML = square.innerHTML.substring(11); // Removes the "<b>By:</b> "
    else if (square.classList.contains("art-genre"))
        square.innerHTML = square.innerHTML.substring(14); // Removes the "<b>Genre:</b> "
}


/**
 * Adds back the info text to the square content. (The "By: " and "Genre: " indicators.)
 * @param {*} square The square to add the text back to.
 */
function resetSquareElemContent(square) {
    if (square.classList.contains("art-artist"))
        square.innerHTML = "<b>By:</b> " + square.innerHTML;
    else if (square.classList.contains("art-genre"))
        square.innerHTML = "<b>Genre:</b> " + square.innerHTML;
}


/**
 * Searches a given album grid square for the given text, and highlights the matching text if found. (THIS ALTERS THE HTML ELEMENT!)
 * @param {*} square The HTML album square to search/highlight.
 * @param {*} whatToSearch The text to search for.
 * @returns Boolean of if the text was found (and the square was highlighted) or not
 */
function searchAndHighlightSquare(square, whatToSearch) {
    let found = false;

    // Search the 3 text components of the grid square
    let parts = square.querySelectorAll(".art-album, .art-artist, .art-genre");
    Array.from(parts).forEach(elem => {
        // Strip the inner text of the cell
        stripSquareElemContent(elem);
        
        // If this grid square component contains the searched text, highlight the text and add the parent square
        let text = elem.textContent.toLowerCase();
        if (text.includes(whatToSearch)) {
            found = true;
            let regex = new RegExp(whatToSearch, 'gi');
            let highlightedText = elem.innerHTML.replace(regex, (match) => `<span class="highlight">${match}</span>`);
            elem.innerHTML = highlightedText;
        }

        // Add back the removed text
        resetSquareElemContent(elem);
    });

    return found;
}


/**
 * Searches all albums in a given grid to the searched for text.
 * @param {*} year The year of the grid to search within.
 * @param {*} whatToSearch The text to search for.
 * @returns A list of HTML album grid elements that contained the searched for text.
 */
function searchGrid(year, whatToSearch) {
    let grid = document.getElementById("album-grid-" + year + "-" + NUM_ALBUMS_PER_ROW);
    let results = [];

    // For each square in the grid, search all its components for matches
    let allGridSquares = grid.querySelectorAll(".art-cell");
    Array.from(allGridSquares).forEach(square => {
        // Save the original state of the square, since it WILL be altered (by highlighting) during the search
        let oldSquare = square.innerHTML;

        // If the search text is found in the square, add a copy of the (highlighted) square to the results
        if (searchAndHighlightSquare(square, whatToSearch)) {
            let clone = square.cloneNode(true);
            clone.innerHTML += "<b>Release year:</b> " + year + "";
            results.push(clone);
        }

        // Reset the square in the grid to its original state
        square.innerHTML = oldSquare;
    });

    return results;
}


/**
 * Searches all the album grids for the searched for text.
 * @param {*} whatToSearch The text to search for.
 */
function searchAllGrids(whatToSearch) {
    // Search the albums grid for each year
    // NOTE: Since I am NOT searching the album table, this search will not work for my favorite tracks, release date, listen date, ect.
    //       It will ONLY work for the artist name, album name, and genre
    let searchResults = []; // Holds a list of album grid squares that contain the searched text
    for (let year = OLDEST_YEAR; year <= CURRENT_YEAR; year++) {
        let foundElements = searchGrid(year, whatToSearch);
        searchResults = searchResults.concat(foundElements);
    }

    // If there were no results, display message
    if (searchResults.length == 0) {
        document.getElementById("search-results-albums-grid").innerHTML = "<div class=table-msg>No matching albums...</div>";
        return false;
    }

    // Update the result grid
    let resultsGrid = createGridFromHtmlSquareList(searchResults);
    document.getElementById(resultsGrid.id).innerHTML = resultsGrid.innerHTML;

    return true;
}


/**
 * Uses the existing HTML element containing the search results in grid form, and converts it into a table format.
 */
function gridResultsToTable() {
    let newTable = document.createElement("tbody");
    newTable.id = "search-results-albums-table";

    let gridResults = document.getElementById("search-results-albums-grid");
    for (let r = 0; r <  gridResults.rows.length; r++) { // Loops through rows of the grid
        for (let i = 0; i <  gridResults.rows[r].cells.length; i++) { // Loops through cells in the row
            let square = gridResults.rows[r].cells[i];

            // Skip placeholder (empty) squares
            if (square.innerHTML == "") {
                continue;
            }

            // Convert the square to a table row (stripping the extra html formatting)
            let newRow = newTable.insertRow();
            let cell = newRow.insertCell();
            cell.innerHTML = square.children[1].innerHTML.slice(square.children[1].innerHTML.indexOf("<i>") + 3); // Album
            cell = newRow.insertCell();
            cell.innerHTML = square.children[2].innerHTML.slice(square.children[2].innerHTML.indexOf("<b>By:</b> <u>") + 14); // Artist
            cell = newRow.insertCell();
            cell.innerHTML = square.children[3].innerHTML.slice(square.children[3].innerHTML.indexOf("<b>Genre:</b> ") + 14); // Genre
            cell = newRow.insertCell();
            cell.innerHTML = square.innerHTML.slice(square.innerHTML.indexOf("<b>Release year:</b> ") + 21); // Release Year
            
            // Color the row the same as the grid
            if (square.classList.contains("ten"))
                highlightElementFromRating(newRow, 10);
            if (square.classList.contains("gold"))
                highlightElementFromRating(newRow, 9);
            if (square.classList.contains("silver"))
                highlightElementFromRating(newRow, 8);
            if (square.classList.contains("bronze"))
                highlightElementFromRating(newRow, 7);
        }
    }

    document.getElementById("search-results-albums-table").replaceWith(newTable);
}


/******************************
**** ALBUM TABLE SEARCHING ****
******************************/
/**
 * Searches each albums CSV to find if any of the albums match the searched for text.
 * @param {*} whatToSearch Text to search for.
 */
function searchAlbumTables(whatToSearch) {
    let resultsTable = document.getElementById("search-results-albums-table");
    resultsTable.innerHTML = "<div class=table-msg>No matching albums...</div>";

    let firstMatch = true;

    for (let year = OLDEST_YEAR; year <= CURRENT_YEAR; year++) {
        let filename = "csv/" + year + getExtensionFromList("Favorite Albums") + ".csv";
        d3.csv(filename).then(function(data) {
            let results = searchCSV(data, whatToSearch, "Albums");

            for (let i = 0; i < results.length; i++) {
                if (firstMatch) {
                    // Reset the table once a result was found (so it does not show "no matching albums..." anymore)
                    resultsTable.innerHTML = "";
                    firstMatch = false;
                }

                // Add the release year
                let cell = results[i].insertCell();
                cell.innerHTML = year;

                // Add the row to the results table
                let newRow = resultsTable.insertRow(-1);
                newRow.replaceWith(results[i]);
                
            }
            document.getElementById("search-results-albums-table").replaceWith(resultsTable);
        });
    }

    return !firstMatch;
}


/***********************
**** SONG SEARCHING ****
***********************/
/**
 * Searches an CSV row for all occurances of a given string
 * @param {*} row The CSV row to search within
 * @param {*} whatToSearch The string to search for
 * @param {*} list What list is being searched ("Albums" or "Songs")
 * @returns A boolean of if the string was found within the CSV row or not
 */
function searchAndHighlightRow(row, whatToSearch, list) {
    let found = false;

    // Search the 3 text components of the grid square
    let parts = [];
    if (list == "Songs")
        parts = Array.from(row.querySelectorAll("td")).slice(0);
    else if (list == "Albums")
        parts = Array.from(row.querySelectorAll("td")).slice(0, 4).concat([Array.from(row.querySelectorAll("td"))[5]]);

    parts.forEach(elem => {
        // If this grid square component contains the searched text, highlight the text and add the parent square
        let text = elem.textContent.toLowerCase();
        if (text.includes(whatToSearch)) {
            found = true;
            let regex = new RegExp(whatToSearch, 'gi');
            let highlightedText = elem.innerHTML.replace(regex, (match) => `<span class="highlight">${match}</span>`);
            elem.innerHTML = highlightedText;
        }
    });

    return found;
}


/**
 * Given CSV data, search each entry for the searched for text.
 * @param {*} data CSV data.
 * @param {*} whatToSearch Text to search for.
 * @param {*} list String indicating "Albums" or "Songs".
 * @returns A list of HTML rows containing the CSV data that matched whatToSearch.
 */
function searchCSV(data, whatToSearch, list) {
    let results = [];

    data.forEach(function(csvRow) {
        // Some previous lists include albums from ANY year
        // I want to exclude those for now, and only include albums release the selected year
        let releaseDate = Date.parse( csvRow["Release Date"] );
        if (releaseDate < Date.parse("1/1/" + SELECTED_YEAR)) {
            return;
        }

        // If I am not showing this album on my lists (meaning it is below a 6 in score), then skip it in the search
        if (!shouldShowAlbum(csvRow["Rating"])) {
            return;
        }

        let newRow = document.createElement("tr");
        if (list == "Songs")
            csvRowToTableRow(newRow, SHOWN_SONG_HEADERS, csvRow);
        else if (list == "Albums")
            csvRowToTableRow(newRow, SHOWN_ALBUM_HEADERS, csvRow);
        
        // Highlight the row depending on its rating
        highlightElementFromRating(newRow, csvRow["Rating"]);

        // Actually search for the text within the row, and highlight any occurances of it
        if(searchAndHighlightRow(newRow, whatToSearch, list)) {
            results.push(newRow.cloneNode(true));
        }
    });

    return results;
}


/**
 * Searches each songs CSV to find if any of the songs match the searched for text.
 * @param {*} whatToSearch Text to search for.
 */
function searchAllSongs(whatToSearch) {
    let resultsTable = document.getElementById("search-results-songs-table");
    resultsTable.innerHTML = "<div class=table-msg>No matching songs...</div>";

    let firstMatch = true;

    for (let year = OLDEST_YEAR; year <= CURRENT_YEAR; year++) {
        let filename = "csv/" + year + getExtensionFromList("Favorite Songs") + ".csv";
        d3.csv(filename).then(function(data) {
            let results = searchCSV(data, whatToSearch, "Songs");

            for (let i = 0; i < results.length; i++) {
                // Reset the table once a result was found (so it does not show "no matching songs..." anymore)
                if (firstMatch) {
                    resultsTable.innerHTML = "";
                    firstMatch = false;
                }

                // Add the release year
                let cell = results[i].insertCell();
                cell.innerHTML = year;

                let newRow = resultsTable.insertRow(-1);
                newRow.replaceWith(results[i]);
            }
            document.getElementById("search-results-songs-table").replaceWith(resultsTable);
        });
    }
}


/******************
**** SEARCHING ****
******************/
/**
 * Handles when the search button is presses
 */
let searchTimer;
function handleSearch() {
    // Get the search text
    let whatToSearch = document.getElementById("search-input").value.toLowerCase();
    if (!whatToSearch) {
        return;
    }

    // Set the global variables
    SELECTED_YEAR = -1;
    SELECTED_LIST = "Search";
    SELECTED_LAYOUT = "GRID";

    // Search the albums
    document.getElementById("search-results-albums-table").innerHTML = "";
    document.getElementById("search-results-songs-table").innerHTML = "";
    let isGridMatch = searchAllGrids(whatToSearch);
    let isTableMatch = searchAlbumTables(whatToSearch);
    searchAllSongs(whatToSearch);

    // If there is a TABLE album match, but not a GRID album match, default to the table view
    // searchAlbumTables() does not block like it should, I think the d3 library is async. As a result, I cannot rely on its return
    // However, searchAllGrids() WILL return the correct result 
    // As a workaround, I will just default to the table if no grid results are found, regardless of if table results are also found
    if (!isGridMatch) {
        SELECTED_LAYOUT = "TABLE";
    }

    // Update the display
    updateDisplay();
}
document.getElementById("search-button").addEventListener("click", function(event){
    handleSearch();
});


/**
 * Watch for when the user presses enter while in the input search box.
 */
document.getElementById("search-input").addEventListener("keydown", function(event){
    if(event.key === 'Enter') {
        handleSearch();        
    }
});


/**
 * Updates which layout is seen in the search results.
 */
function updateSearch() {
    // If in GRID layout, convert to table
    if (SELECTED_LAYOUT == "GRID") {
        document.getElementById("search-albums-grid-container").classList.remove("hidden");
        document.getElementById("search-albums-table-container").classList.add("hidden");
    }
    // If in TABLE layout, convert to grid
    else if (SELECTED_LAYOUT == "TABLE") {
        document.getElementById("search-albums-grid-container").classList.add("hidden");
        document.getElementById("search-albums-table-container").classList.remove("hidden");
    }
}

