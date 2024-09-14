const OLDEST_YEAR = 2019;
const CURRENT_YEAR = parseInt(new Date().getFullYear());
const NUM_YEARS_TO_SHOW = 5;

let SELECTED_YEAR = CURRENT_YEAR; // Default year to show
let SELECTED_LIST = "Favorite Albums"; // Default list to show

let SORTABLE_HEADERS = [""]
let HIDDEN_HEADERS = [""]


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
 * @param {*} list_type The currently selected list type (e.g. "Favorite Albums" or "Favorite Songs")
 * @returns A string of the filename extension to use
 */
function getExtensionFromList(list_type) {
    let extension = "";
    if (list_type == "Favorite Albums")
        extension = "";
    else if (list_type == "Favorite Songs")
        extension = "_songs";

    return extension
}


/**
 * Imports all the HTML in a file into another file.
 * This is done by adding the "include-html='<filename.html>'" attribute to a div, where the HTML in <filename.html> will be put into that div.
 * Copy/pasted straight from https://www.w3schools.com/howto/howto_html_include.asp.
 */
function includeHTML() {
    let z, i, elmnt, file, xhttp;

    /* Loop through a collection of all HTML elements: */
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
        elmnt = z[i];

        /* Search for elements with a certain atrribute:*/
        file = elmnt.getAttribute("include-html");
        if (file) {
            /* Make an HTTP request using the attribute value as the file name: */
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4) {
                    if (this.status == 200) { elmnt.innerHTML = this.responseText; }
                    if (this.status == 404) { elmnt.innerHTML = "Page not found."; }

                    /* Remove the attribute, and call this function once more: */
                    elmnt.removeAttribute("include-html");
                    includeHTML();
                }
            }

            xhttp.open("GET", file, true);
            xhttp.send();

            /* Exit the function: */
            return;
        }
    }
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
    let new_row = header.insertRow();

    // Populate the new header row depending on the selected list
    if (SELECTED_LIST == "Favorite Songs") {
        addHeadersToRow(new_row, ["Song", "Artist", "Album", "Genre"]);
    }
    else if (SELECTED_LIST == "Favorite Albums") {
        addHeadersToRow(new_row, ["Artist", "Album", "Genre", "Favorite Songs", "Rating"]);
    }
}


/**
 * Highlight an HTML row as gold, silver, or bronze if the rating is high enough.
 * @param {*} row The HTML row to potentially highligh
 * @param {*} rating The album's rating used to determine if highlighting is needed
 */
function highlight_row_from_rating(row, rating) {
    if (parseInt(rating) >= 9) {
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
 * Transfers the data in a CSV row object into an HTML row object.
 * @param {*} html_row The HTML row object that will be populated with the new cells containing the CSV data
 * @param {*} headers_to_include The list of column headers you want to include from the CSV data
 * @param {*} csv_row The CSV row object containing the data to transfer
 * @param {*} default_val The default value to use if the CSV cell is empty or does not exist (defaultly "-")
 */
function convertCsvRowToHtmlRow(html_row, headers_to_include, csv_row, default_val = "-") {
    headers_to_include.forEach(function(header) {
        let cell = html_row.insertCell();
        cell.innerHTML = csv_row[header] ? csv_row[header] : default_val;
    })
}


/**
 * Loads all the data in the passed in CSV into the HTML albums table.
 * @param {*} data 
 */
function csvToHtml(data) {
    let table = document.getElementById("album-table-body");
    
    // Loop through each row in the CSV data (which is an album entry), and copy the data into the HTML table
    data.forEach(function(csv_row) {
        // Some previous lists include albums from ANY year
        // I want to exclude those for now, and only include albums release the selected year
        let release_date = Date.parse( csv_row["Release Date"] );
        if (release_date < Date.parse("1/1/" + SELECTED_YEAR)) {
            return;
        }

        // Insert the new row
        let new_row = table.insertRow(-1);

        // Populate the row depending on what list is selected
        if (SELECTED_LIST == "Favorite Songs") {
            convertCsvRowToHtmlRow(new_row, ["Song", "Artist", "Album", "Genre"], csv_row);
        }
        else if (SELECTED_LIST == "Favorite Albums") {
            convertCsvRowToHtmlRow(new_row, ["Artist", "Album", "Genre", "Favorite Songs", "Rating"], csv_row);
        }
        
        // Highlight the row gold/silver/bronze if the score is high enough
        highlight_row_from_rating(new_row, csv_row["Rating"]);
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
            sortTable(4); // 4 == "Rating"
        }
    });
}


/********************************
**** TABLE SORTING FUNCTIONS ****
********************************/
/**
 * Make all header order arrows grayed out triangles pointing up EXCEPT the active header.
 * @param {*} active_element The HTML span element of the active header
 */
function updateOrderTriangles(active_element) {
    document.querySelectorAll("#album-list #table-headers .header span").forEach(span => {
        // If this is a column NOT being used for sorting, gray out the order triangle and set it pointing up
        if (span != active_element){
            span.innerHTML = "▲";
            span.classList.remove("active");
        }
        // If this is the active element, update the triangle and class
        else {
            (order.innerHTML == "▲") ? (order.innerHTML = "▼") : (order.innerHTML = "▲"); // Flip the triangle
            active_element.classList.add("active");
        }
    });
}


/**
 * Swaps two adjacent rows in an HTML table.
 * @param {*} top_row Top row (of the two adjacent rows to swap)
 * @param {*} bot_row Bottom row (of the two adjacent rows to swap)
 */
function swapAdjacentRows(top_row, bot_row) {
    top_row.parentNode.insertBefore(bot_row, top_row);
}


/**
 * Perform a bubble sort to order the table by the selected header.
 * @param {*} header_index The header/column to order the table by
 * @param {*} order The direction to sort in ("asc" or "desc")
 */
function tableBubbleSort(header_index, order) {
    let table = document.getElementById("album-table-body");
    let rows = table.rows;

    // It's fine doing a simple bubble sort (performance wise) since n is always small for my tables (never going to exceed 365)
    for (let i = 0; i < rows.length - 1; i++) {
        
        swapped = false;
        
        for (let j = 0; j < rows.length - i - 1; j++) {
            let top_cell = rows[j].cells[header_index].innerHTML
            let bot_cell = rows[j + 1].cells[header_index].innerHTML

            // Convert to numbers if the column is numeric
            if (!isNaN(top_cell) && !isNaN(bot_cell)) {
                top_cell = Number(top_cell);
                bot_cell = Number(bot_cell);
            }
            
            // Perform the swap depending on if we are in increasing or decreasing order
            if ((order == "desc"  && bot_cell > top_cell) || (order == "asc" && bot_cell < top_cell)) {
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
 * Sort the albums table by the column corresponding to header_index.
 * @param {*} header_index Column index to sort by
 */
function sortTable(header_index) {
    // The current order the table is sorted by (can be null)
    let order = document.getElementById("header_" + header_index + "_order");

    // If it is already sorted by this column, get the current order and do the opposite
    // If it is not sorted (or there is no previouys order), default to descending
    if (order == null || order.innerHTML == "▲") { // Short circuit if there is no order (i.e. we are doing the default ordering)
        tableBubbleSort(header_index, "desc");
    }
    else {
        tableBubbleSort(header_index, "asc");
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

    // Update the table data
    updateTable();
});


/**
 * Updates the table when a new list (e.g. "Favorite Songs" or "Favorite Albums") is selected.
 */
document.getElementById("list-list").addEventListener("click", async function(event) {
    let list_type = event.target.innerHTML;

    // TODO: If this year does not exist, do nothing (maybe print banner?)

    let extension = getExtensionFromList(list_type);
    let filename = "csv/" + SELECTED_YEAR + extension + ".csv";

    let exists = await checkFileExists(filename);
    if (!exists) {
        console.log("ERROR: " + filename + " does not exist");
        return;
    }    
    
    // Set the currently selected list and change the active button
    SELECTED_LIST = list_type;
    updateActiveList();

    // Update the table data
    updateTable();
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
        let albums_exists = await checkFileExists(filename);
        
        // Check if a "Favorite Songs" list exists for this year
        extension = getExtensionFromList("Favorite Songs");
        filename = "csv/" + year + extension + ".csv";
        let songs_exists = await checkFileExists(filename);
        
        // Disable/enable each button depending on if a CSV list file exists
        if (albums_exists || songs_exists) {
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
        let year_element = document.getElementById("year" + i);
        document.getElementById("year" + i).innerHTML = parseInt(year_element.innerHTML) + NUM_YEARS_TO_SHOW
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
        let year_element = document.getElementById("year" + i);
        document.getElementById("year" + i).innerHTML = parseInt(year_element.innerHTML) - NUM_YEARS_TO_SHOW;
    }
    
    // Update buttons and visuals
    grayOutMissingYears();
    updateActiveYear();
    updateYearIncDecButtons();
};

