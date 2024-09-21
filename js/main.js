// Years
const OLDEST_YEAR = 2018;
const CURRENT_YEAR = parseInt(new Date().getFullYear());
const NUM_YEARS_TO_SHOW = 5;

// List selectors
let SELECTED_YEAR = CURRENT_YEAR; // Default year to show
let SELECTED_LIST = "Favorite Albums"; // Default list to show

// Headers
const ALBUMS_CSV_HEADERS = ["Artist", "Album", "Genre", "Release Date", "Listened On", "Favorite Songs", "Rating", "Hidden Ranking"];
let SHOWN_ALBUM_HEADERS = ["Artist", "Album", "Genre", "Favorite Songs"];

const SONGS_CSV_HEADERS = ["Song", "Album", "Artist", "Genre", "Hidden Ranking"];
let SHOWN_SONG_HEADERS = ["Song", "Artist", "Album", "Genre"];

let SORTABLE_HEADERS = [""];

const SHOW_RATING = SHOWN_ALBUM_HEADERS.includes("Rating");

/************************
**** GENERAL HELPERS ****
************************/

/**
 * Check if a given file exists.
 * @param {*} filename The filename to check the existence for
 * @returns 
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


/***********************************
**** CSV & TABLE DATA FUNCTIONS ****
***********************************/
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
            cell.innerHTML = "<div class=\"header\">" + header + "<span id=\"header_" + i + "_order\">▲</span> </div>";
            cell.setAttribute("onclick", "sortTable(" + i + ")");
        }
    });
}


/**
 * Updates the values of the table headers to match the selected list.
 */
function updateTableHeaders() {
    // Clear the current headers
    let header = document.getElementById("table-headers");
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
 * Highlight an HTML row as gold, silver, or bronze if the rating is high enough.
 * @param {*} row The HTML row to potentially highligh
 * @param {*} rating The album's rating used to determine if highlighting is needed
 */
function highlightRowFromRating(row, rating) {
    if (parseInt(rating) == 10) {
        row.classList.add("ten");
    }

    else if (parseInt(rating) >= 9) {
        row.classList.add("gold");
    }
    else if (parseInt(rating) >= 8) {
        row.classList.add("silver");
    }
    else if (parseInt(rating) >= 7) {
        row.classList.add("bronze");
    }
}


/**
 * Transfers all the data in a CSV row object into an HTML row object, and hides the columns not in headersToShow.
 * @param {*} htmlRow The HTML row object that will be populated with the new cells containing the CSV data
 * @param {*} headersToShow The list of column headers you want to include from the CSV data
 * @param {*} csvRow The CSV row object containing the data to transfer
 * @param {*} defaultVal The default value to use if the CSV cell is empty or does not exist (defaultly "-")
 */
function convertCsvRowToHtmlRow(htmlRow, headersToShow, csvRow, defaultVal = "-") {
    // Add each piece of info in the CSV to the HTML table
    for (const [key, value] of Object.entries(csvRow)) {
        let cell = htmlRow.insertCell();
        cell.innerHTML = value ? value : defaultVal;

        // Hide all cells in columns I don't care about (but keep the data accessable)
        if (!headersToShow.includes(key)) {
            cell.classList.add("hidden");
        }
    }
}


/**
 * Loads all the data in the passed in CSV into the HTML albums table.
 * @param {*} data 
 */
function csvToHtml(data) {
    let table = document.getElementById("album-table-body");
    
    // Loop through each row in the CSV data (which is an album entry), and copy the data into the HTML table
    data.forEach(function(csvRow) {
        // Some previous lists include albums from ANY year
        // I want to exclude those for now, and only include albums release the selected year
        let releaseDate = Date.parse( csvRow["Release Date"] );
        if (releaseDate < Date.parse("1/1/" + SELECTED_YEAR)) {
            return;
        }

        if (!SHOW_RATING) {
            console.log("NOT SHOWING RATING")
            if (csvRow["Rating"] != "" && parseFloat(csvRow["Rating"]) < 6) {
                return;
            }
        }

        // Insert the new row
        let newRow = table.insertRow(-1);

        // Populate the row depending on what list is selected
        if (SELECTED_LIST == "Favorite Songs") {
            convertCsvRowToHtmlRow(newRow, SHOWN_SONG_HEADERS, csvRow);
        }
        else if (SELECTED_LIST == "Favorite Albums") {
            convertCsvRowToHtmlRow(newRow, SHOWN_ALBUM_HEADERS, csvRow);
        }
        
        // Highlight the row gold/silver/bronze if the score is high enough
        highlightRowFromRating(newRow, csvRow["Rating"]);
    });
}


/**
 * Uses the SELECTED_YEAR and SELECTED_LIST to update the data in the albums/songs table.
 * This is called on startup, and whenever the list type (albums/songs) or list year is changed.
 */
function updateTable() {
    // Clear the current table
    document.getElementById("album-table-body").innerHTML = "";

    // Update the table headers to match the selected list
    // This also makes sure there is the appropriate number of columns in the table
    updateTableHeaders();

    // Load in the new CSV and display the new data
    let extension = getExtensionFromList(SELECTED_LIST);
    let filename = "csv/" + SELECTED_YEAR + extension + ".csv";
    d3.csv(filename).then(function(data) {
        csvToHtml(data);

        // Sort the data in the table (if needed)
        // NOTE: This WONT WORK if it is pasted after the d3.csv() call, and idk why
        if (SELECTED_LIST == "Favorite Albums") {
            sortTable(ALBUMS_CSV_HEADERS.indexOf("Hidden Ranking"));
        }
    });
}


/********************************
**** TABLE SORTING FUNCTIONS ****
********************************/
/**
 * Make all header order arrows grayed out triangles pointing up EXCEPT the active header.
 * @param {*} activeElement The HTML span element of the active header
 */
function updateOrderTriangles(activeElement) {
    document.querySelectorAll("#album-list #table-headers .header span").forEach(span => {
        // If this is a column NOT being used for sorting, gray out the order triangle and set it pointing up
        if (span != activeElement){
            span.innerHTML = "▲";
            span.classList.remove("active");
        }
        // If this is the active element, update the triangle and class
        else {
            (order.innerHTML == "▲") ? (order.innerHTML = "▼") : (order.innerHTML = "▲"); // Flip the triangle
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
    let table = document.getElementById("album-table-body");
    let rows = table.rows;

    // It's fine doing a simple bubble sort (performance wise) since n is always small for my tables (never going to exceed 365)
    for (let i = 0; i < rows.length - 1; i++) {
        
        swapped = false;
        
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
    // If it is not sorted (or there is no previouys order), default to descending
    if (order == null || order.innerHTML == "▲") { // Short circuit if there is no order (i.e. we are doing the default ordering)
        tableBubbleSort(headerIndex, "desc"); // Flip to ▼
    }
    else {
        tableBubbleSort(headerIndex, "asc"); // Flip to ▲
    }

    // Update the visuals of the order triangle(s)
    if (order != null) {
        updateOrderTriangles(order);
    }
}


/****************************
**** YEAR/LIST SELECTORS ****
*****************************/
/**
 * Updates what year buttom is shown as the "active" year.
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
 * Hides the alert message banner
 * (This is only here for the setTimeout function)
 */
function hideAlertBanner() {
    let alert = document.getElementById("alert-banner");
    alert.classList.add("hidden");
}

/**
 * Updates the text and link to the spotify playlist above the table.
 */
playlistLinks = {
    "Albums 2024" : "https://open.spotify.com/playlist/5Gc046e1S0rptnfVX2TQaT?si=432c76f9d9f042b1",
    "Songs 2024" : "https://open.spotify.com/playlist/7nzU9D67SJdgd41dLbRwcf?si=18384ce1a1d54f9d",
    "Albums 2023" : "https://open.spotify.com/playlist/4qVkYlxDRv6gylOjKKcmWm?si=86fa90d3fc5346d2",
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
function updateSpotifyPlaylist() {
    let playlistLink = document.getElementById("playlist-link");

    // Update the text / name of the playlist
    playlistName = (SELECTED_LIST == "Favorite Albums") ? "Albums " : "Songs ";
    playlistName += String(SELECTED_YEAR)

    playlistLink.innerHTML = playlistName;

    // Update the link to the playlist
    playlistLink.href = playlistLinks[playlistName];
}


/**
 * Updates the table when a new year is selected.
 */
document.getElementById("year-list").addEventListener("click", async function(event) {
    let year = event.target.innerHTML;

    // TODO: If this year does not exist, do nothing (maybe print banner?)

    let extension = getExtensionFromList(SELECTED_LIST);
    let filename = "csv/" + year + extension + ".csv";

    let exists = await checkFileExists(filename);
    if (!exists) {
        console.log("ERROR: " + filename + " does not exist");
        return;
    }

    // Set the currently selected year and change the active button
    SELECTED_YEAR = year;

    updateActiveYear();
    updateSpotifyPlaylist();
    updateTable();
});


/**
 * Updates the table when a new list (e.g. "Favorite Songs" or "Favorite Albums") is selected.
 */
document.getElementById("list-list").addEventListener("click", async function(event) {
    let listType = event.target.innerHTML;

    // TODO: If this year does not exist, do nothing (maybe print banner?)

    let extension = getExtensionFromList(listType);
    let filename = "csv/" + SELECTED_YEAR + extension + ".csv";

    let exists = await checkFileExists(filename);
    if (!exists) {
        console.log("ERROR: " + filename + " does not exist");

        // Switch to the current year's list and display an alert
        let alert_msg = document.getElementById("alert-msg");
        alert_msg.innerHTML = "\"" + listType + "\" list does not exist for " + String(SELECTED_YEAR)
        
        let alert = document.getElementById("alert-banner");
        alert.classList.remove("hidden");

        SELECTED_YEAR = CURRENT_YEAR;
    }    
    
    // Set the currently selected list and change the active button
    SELECTED_LIST = listType;

    updateActiveList();
    grayOutMissingYears();
    updateSpotifyPlaylist();
    updateTable();

    // Have to perform more updates if the selected list didn't exist
    // (Basically mimicing clicking on a new year)
    if (!exists) {
        updateActiveYear();
        updateSpotifyPlaylist();
        updateTable();
        setTimeout(hideAlertBanner, 8*1000)
    }
});


/**************************
**** YEAR LIST BUTTONS ****
**************************/
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
    // Must be async so it can call checkFileExists()

    for (let i = 1; i <= NUM_YEARS_TO_SHOW; i++) {
        let year = document.getElementById("year" + i).innerHTML;
        
        // Check if a "Favorite Albums" list exists for this year
        let extension = getExtensionFromList("Favorite Albums");
        let filename = "csv/" + year + extension + ".csv";
        let albumsExist = await checkFileExists(filename);
        
        // Check if a "Favorite Songs" list exists for this year
        extension = getExtensionFromList("Favorite Songs");
        filename = "csv/" + year + extension + ".csv";
        let songsExist = await checkFileExists(filename);

        console.log(year + " FILE EXISTS ? " + String(albumsExist));
        console.log(year + " FILE EXISTS ? " + String(songsExist));
        
        // Disable/enable each button depending on if a CSV list file exists
        if ((SELECTED_LIST == "Favorite Albums" && albumsExist) || (SELECTED_LIST == "Favorite Songs" && songsExist)) {
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
document.getElementById("year-increase").onclick = function() {
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
};


/** 
 * Decrease the years shown by the year-list.
 */
document.getElementById("year-decrease").onclick = function() {
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
};


/**************************************
**** IN-BROWSER EDITING (DEV ONLY) ****
**************************************/
// These functions allow me to modify the album table in the web browser, rather than having to manually edit the CSV data
// ALL editing functionality should be kept to this section, and it should not mingle with any other core functions
// Because of this (and the fact that this isn't going to ever be active for deployment), this code might be a bit gross (and that's okay with me)

const EDITING = false;

/**
 * If I am editing in the browser, modify certain elements and adjust the view to allow me to edit.
 */
if (EDITING) {
    SHOWN_ALBUM_HEADERS = SHOWN_ALBUM_HEADERS.concat(["Hidden Ranking", "RANKING UP", "RANKING DOWN", "PRINT TABLE", "RESET RANKINGS"]);
    SHOWN_SONG_HEADERS = SHOWN_SONG_HEADERS.concat(["Hidden Ranking", "RANKING UP", "RANKING DOWN", "PRINT", "RESET"]);
    addEditingElements();
}

if (EDITING) { document.querySelector('#list-select-navbar').addEventListener('click', (ev) => { 
    addEditingElements();
});}


/**
 * Adds cells to the table that when clicked on, allow me to move around the rows.
 */
function addEditingCells() {
    let table = document.getElementById("album-table-body");
    let rows = table.rows;

    for (let i = 0; i < rows.length; i++) {
        let cell = rows[i].insertCell();
        cell.innerHTML = "UP";
        cell = rows[i].insertCell();
        cell.innerHTML = "DOWN";
        cell = rows[i].insertCell();
        cell.innerHTML = "PRINT";
        cell = rows[i].insertCell();
        cell.innerHTML = "RESET";
    }   
}


/**
 * Wait for all the base data to be loaded in (and sorted), and then add the new editing elements.
 */
async function addEditingElements() {
    await new Promise(r => setTimeout(r, 0.1*1000)); // sleep 0.1 seconds
    addEditingCells();
}

/**
 * Given an HTML tag, find the first HTML element of that tag that contains certain text.
 * @param {*} tag The HTML tag to search all of (e.g. "p", "div", "td")
 * @param {*} text The text to search for within the HTML elements
 * @returns The HTML element if found, otherwise null
 */
function findElementByInnerText(tag, text) {
    const elements = document.getElementsByTagName(tag);

    // Iterate through the elements and check if the innerHTML matches
    for (let element of elements) {
        if (element.textContent.toLowerCase().trim() === text.toLowerCase()) {
            return element;
        }
    }

    console.log("ERROR: Could not find <" + tag + "> with text \"" + text + "\"");
    return null;
}


/**
 * Given a list of string values, join them together in CSV format (i.e. comma separating all values except the last one, and putting quotes around values with "," in them).
 * @param {*} values List of string values to join together
 * @returns The final joined-together string
 */
function csv_join(values) {
    let result = "";

    if (values.length == 0)
        return result;
    
    for (let i = 0; i < values.length - 1; i++) {
        result += (values[i].includes(",")) ? ("\"" + values[i] + "\",") : (values[i] + ",");
    }
    result += (values[values.length - 1].includes(",")) ? "\"" + values[values.length - 1] + "\"," : values[values.length - 1] + ",";

    return result;
}


/**
 * Reprint the CSV EXACTLY as it is, EXCEPT change the "Hidden Ranking" to match what is in the table.
 * @param {*} csv_data The D3 CSV data, could be the albums CSV or the songs CSV
 */
function printEditedCSV(csv_data) {   
    let table_string = (SELECTED_LIST == "Favorite Albums") ?
            "Artist,Album,Genre,Release Date,Listened On,Favorite Songs,Rating,Hidden Ranking\n" :
            "Song,Album,Artist,Genre,Hidden Ranking\n";
    let hr_index = (SELECTED_LIST == "Favorite Albums") ? ALBUMS_CSV_HEADERS.indexOf("Hidden Ranking") : SONGS_CSV_HEADERS.indexOf("Hidden Ranking");

    csv_data.forEach(function(csv_row, r) {
        // Copy all non-header rows, EXCEPT put in the new hidden ranking
        first_rows = csv_join( Object.values(csv_row).slice(0, hr_index) );
        hidden_ranking = findElementByInnerText("td", csv_row["Album"]).parentElement.children[hr_index].innerHTML
        last_rows = csv_join( Object.values(csv_row).slice(hr_index + 1) );

        table_string += first_rows + hidden_ranking + last_rows + "\n"
    });

    console.log(table_string)
}


/**
 * Resets all the hidden rankings to the index the album is in the ORDERED list.
 */
function resetRankings() {
    console.log("RESETTING")
    let table = document.getElementById("album-table-body");
    let rows = table.rows;

    for (let i = 0; i < rows.length; i++) {
        rows[i].cells[ALBUMS_CSV_HEADERS.indexOf("Hidden Ranking")].innerHTML = rows.length - i;
    }

    rankingsAreReset = true;
}


/**
 * Performs the associated actions when the EDITING cells are clicked on
 */
if (EDITING) { document.querySelector('#album-table').addEventListener('click', (ev) => { 
    // Get the clicked on coordinates
    [x, y] = [
        ev.target.cellIndex, 
        ev.target.parentElement.rowIndex
    ];
    if (x === undefined || y === undefined) {
        return;
    }
    y = y - 1;

    // Get table values before acting
    let table = document.getElementById("album-table-body");
    let rows = table.rows;

    let hr_index = (SELECTED_LIST == "Favorite Albums") ? ALBUMS_CSV_HEADERS.indexOf("Hidden Ranking") : SONGS_CSV_HEADERS.indexOf("Hidden Ranking");

    // Move row up
    if (x == hr_index + 1) {
        // At the top, don't do anything
        if (y == 0) { 
            return;
        }

        // Swap hidden rankings
        rows[y].cells[hr_index].innerHTML = parseInt(rows[y].cells[hr_index].innerHTML) + 1;
        rows[y - 1].cells[hr_index].innerHTML = parseInt(rows[y - 1].cells[hr_index].innerHTML) - 1;

        // Swap rows
        swapAdjacentRows(rows[y - 1], rows[y]);
    }

    // Move row down
    else if (x == hr_index + 2) {
        // Swap hidden rankings
        rows[y].cells[hr_index].innerHTML = parseInt(rows[y].cells[hr_index].innerHTML) - 1;
        rows[y + 1].cells[hr_index].innerHTML = parseInt(rows[y + 1].cells[hr_index].innerHTML) + 1;

        // Swap rows
        swapAdjacentRows(rows[y], rows[y + 1]);
    }

     // Print the HTML as a CSV (since JS can't edit local files, just copy/paste this print into the CSV file)
    else if (x == hr_index + 3) {
        let extension = getExtensionFromList(SELECTED_LIST);
        let filename = "csv/" + SELECTED_YEAR + extension + ".csv";
        d3.csv(filename).then(function(data) {
            printEditedCSV(data);
        });
    }
    
    // Reset the hidden rankings
    else if (x == hr_index + 4) {
        resetRankings();
    }
});}