const OLDEST_YEAR = 2019;
const CURRENT_YEAR = 2024;
const NUM_YEARS = 5;

var SELECTED_YEAR = CURRENT_YEAR;
var SELECTED_LIST = "all";


/***************
**** HELPER ****
***************/

// Check if a given file (mostly used to check for CSV files) exists
function checkFileExists(filename) {
    return fetch(filename, { method: 'HEAD' })
        .then(response => response.ok)
        .catch(() => false);
}


// Takes in the list type clicked on, and converts it into a CSV filename extension
function getExtensionFromList(list_type) {
    var extension = "";
    if (list_type == "Full Year List")
        extension = "";
    else if (list_type == "Favorite Albums")
        extension = "_albums";
    else if (list_type == "Favorite Songs")
        extension = "_songs";

    return extension
}


/********************
**** CSV LOADING ****
********************/
// Loads newest CSV by on startup
d3.csv("csv/2024.csv").then(function(data) {
    displayData(data);
});


// Loads passed in CSV data into the album list table 
function displayData(data) {
    const table = document.getElementById("album-table-body");
    
    // Loop through each entry (which is an album), and copy the data into a new table row
    data.forEach(function(csv_row, r) {
        new_row = table.insertRow(-1);
        // album_art = new_row.insertCell(-1);
        artist = new_row.insertCell(-1);
        album = new_row.insertCell(-1);
        genre = new_row.insertCell(-1);
        favorite_songs = new_row.insertCell(-1);
        rating = new_row.insertCell(-1);

        // album_art.innerHTML = "-";
        artist.innerHTML = csv_row["Artist"] ? csv_row["Artist"] : "-";
        album.innerHTML = csv_row["Album"] ? csv_row["Album"] : "-";
        genre.innerHTML = csv_row["Genre"] ? csv_row["Genre"] : "-";
        favorite_songs.innerHTML = csv_row["Favorite Songs"] ? csv_row["Favorite Songs"] : "-";
        rating.innerHTML = csv_row["Rating"] ? csv_row["Rating"] : "-";

        console.log(parseInt(rating.innerHTML));
        if (parseInt(rating.innerHTML) >= 9) {
            new_row.classList.add("gold");
        }
        else if (parseInt(rating.innerHTML) >= 8) {
            new_row.classList.add("silver");
        }
        else if (parseInt(rating.innerHTML) >= 7) {
            new_row.classList.add("bronze");
        }
    });
}


// Uses the SELECTED_YEAR and SELECTED_LIST to update the table with the correct data
function updateTable() {
    // Clear the current table
    document.getElementById("album-table-body").innerHTML = "";

    // Load in the new CSV and display the new data
    var extension = getExtensionFromList(SELECTED_LIST);
    var filename = "csv/" + SELECTED_YEAR + extension + ".csv"
    d3.csv(filename).then(function(data) {
        displayData(data);
    });
}

/****************************
**** YEAR/LIST SELECTORS ****
*****************************/
// Updates what year is shown as the "active" year
function updateActiveYear() {
    document.querySelectorAll("#year-list button").forEach(btn => {
        if (btn.innerHTML != SELECTED_YEAR) {
            btn.classList.remove("active")
        }
        else {
            btn.classList.add("active")
        }
    });
}


// Updates what list is shown as the "active" list
function updateActiveList() {
    document.querySelectorAll("#list-list button").forEach(btn => {
        if (btn.innerHTML != SELECTED_LIST) {
            btn.classList.remove("active")
        }
        else {
            btn.classList.add("active")
        }
    });
}


// Sets the selected year when a "Year-List" button is clicked
document.getElementById("year-list").addEventListener("click", async function(event) {
    var year = event.target.innerHTML;

    // TODO: If this year does not exist, do nothing (maybe print banner?)
    var filename = "csv/" + year + ".csv";
    const exists = await checkFileExists(filename);
    if (!exists) {
        console.log("ERROR: " + filename + " does not exist")
        return;
    }

    // Set the currently selected year and change the active button
    SELECTED_YEAR = year;
    updateActiveYear();

    // Update the table data
    updateTable();
});


// Sets the selected list when a "List-List" button is clicked
document.getElementById("list-list").addEventListener("click", async function(event) {
    var list_type = event.target.innerHTML;

    // TODO: If this year does not exist, do nothing (maybe print banner?)
    var extension = getExtensionFromList(list_type)
    var filename = "csv/" + SELECTED_YEAR + extension + ".csv";
    const exists = await checkFileExists(filename);
    if (!exists) {
        console.log("ERROR: " + filename + " does not exist")
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
// Grays out all buttons of years without corresponding CSV files
async function grayOutMissingYears() {
    for (let i = 1; i <= NUM_YEARS; i++) {
        year = document.getElementById("year" + i).innerHTML;

        var filename = "csv/" + year + ".csv";
        const exists = await checkFileExists(filename);
        
        // Disable/enable each button depending on if the CSV file exists
        if (exists) {
            document.getElementById("year" + i).disabled = false;
        }
        else {
            document.getElementById("year" + i).disabled = true;
        }
    }
}


// Shift the years shown by the year-list
document.getElementById("year-increase").onclick = function() {
    // Don't let the user go into the future
    if (document.getElementById("year5").innerHTML >= CURRENT_YEAR) {
        return
    }

    // Increase all year numbers
    for (let i = 1; i <= NUM_YEARS; i++) {
        year_element = document.getElementById("year" + i);
        document.getElementById("year" + i).innerHTML = parseInt(year_element.innerHTML) + NUM_YEARS
    }

    // Gray out all years without a CSV
    grayOutMissingYears();

    // Update which year is active
    updateActiveYear();

    // If the user is at the end, gray out the button
    document.getElementById("year-increase").disabled = false;
    document.getElementById("year-decrease").disabled = false;
    if (document.getElementById("year5").innerHTML >= CURRENT_YEAR) {
        document.getElementById("year-increase").disabled = true;
    }
};


// Shift the years shown by the year-list
document.getElementById("year-decrease").onclick = function() {
    // Don't let the user go before 2019
    if (document.getElementById("year1").innerHTML <= OLDEST_YEAR) {
        return
    }

    // Decrease all year numbers
    for (let i = 1; i <= NUM_YEARS; i++) {
        year_element = document.getElementById("year" + i);
        document.getElementById("year" + i).innerHTML = parseInt(year_element.innerHTML) - NUM_YEARS
    }

    // Gray out all years without a CSV
    grayOutMissingYears();

    // Update which year is active
    updateActiveYear();

    // TODO: If the user is at the end, gray out the button
    document.getElementById("year-increase").disabled = false;
    document.getElementById("year-decrease").disabled = false;
    if (document.getElementById("year1").innerHTML <= OLDEST_YEAR) {
        document.getElementById("year-decrease").disabled = true;
    }
};

