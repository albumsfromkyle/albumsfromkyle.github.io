const OLDEST_YEAR = 2019;
const CURRENT_YEAR = 2024;
const NUM_YEARS = 5;

var SELECTED_YEAR = CURRENT_YEAR;


/***************
**** HELPER ****
***************/

// Check if a given file (mostly used to check for CSV files) exists
function checkFileExists(filename) {
    return fetch(filename, { method: 'HEAD' })
        .then(response => response.ok)
        .catch(() => false);
}


function updateActiveYear() {
    document.querySelectorAll("#year-list button").forEach(btn => {
        console.log(btn.innerHTML);
        console.log(btn.innerHTML == SELECTED_YEAR);
        if (btn.innerHTML != SELECTED_YEAR) {
            btn.classList.remove("active")
        }
        else {
            btn.classList.add("active")
        }
    });
}


/********************
**** CSV LOADING ****
********************/
// Loads newest CSV by on startup
d3.csv("csv/2024.csv").then(function(data) {
    displayData(data);
});


// Detects when one of the "Year-Menu" elements is clicked on
document.getElementById("year-list").addEventListener("click", async function(event) {
    var year = event.target.innerHTML;

    // TODO: If this year does not exist, do nothing (maybe print banner?)
    var filename = "csv/" + year + ".csv";
    const exists = await checkFileExists(filename);
    if (!exists) {
        return;
    }

    // Clear the current table
    document.getElementById("album-table-body").innerHTML = "";

    // Load in the new CSV and display the new data
    d3.csv("csv/" + year + ".csv").then(function(data) {
        displayData(data);
    });
    
    // Set the currently selected year and change the active button
    SELECTED_YEAR = year;
    updateActiveYear();
});


// Loads passed in CSV data into the album list table 
function displayData(data) {
    const table = document.getElementById("album-table-body");
    
    // Loop through each entry (which is an album), and copy the data into a new table row
    data.forEach(function(csv_row, r) {
        new_row = table.insertRow(-1);
        album_art = new_row.insertCell(-1);
        artist = new_row.insertCell(-1);
        album = new_row.insertCell(-1);
        genre = new_row.insertCell(-1);
        favorite_songs = new_row.insertCell(-1);
        rating = new_row.insertCell(-1);

        album_art.innerHTML = "-";
        artist.innerHTML = csv_row["Artist"] ? csv_row["Artist"] : "-";
        album.innerHTML = csv_row["Album"] ? csv_row["Album"] : "-";
        genre.innerHTML = csv_row["Genre"] ? csv_row["Genre"] : "-";
        favorite_songs.innerHTML = csv_row["Favorite Songs"] ? csv_row["Favorite Songs"] : "-";
        rating.innerHTML = csv_row["Rating"] ? csv_row["Rating"] : "-";
    });

    // TODO: Add row highlighting depending on rating
}


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

