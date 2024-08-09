const OLDEST_YEAR = 2019;
const CURRENT_YEAR = 2024;
const NUM_YEARS = 5;

var SELECTED_YEAR = CURRENT_YEAR;
var SELECTED_LIST = "Full Year List";


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
// Highlight the row as gold, silver, or bronze if the rating is high enough
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


// Loads passed in CSV data into the album list table 
function displayCSVData(data) {
    const table = document.getElementById("album-table-body");
    
    updateTableHeaders();

    // Loop through each entry (which is an album), and copy the data into a new table row
    data.forEach(function(csv_row, r) {
        // Some previous lists include albums from ANY year
        // I want to exclude those for now, and only include albums release the selected year
        release_date = Date.parse( csv_row["Release Date"] );
        if (release_date < Date.parse("1/1/" + SELECTED_YEAR)) {
            return;
        }

        new_row = table.insertRow(-1);

        // Populate the row depending on what list is selected
        if (SELECTED_LIST == "Favorite Songs") {
            ["Song", "Artist", "Album", "Genre"].forEach(function(label) {
                cell = new_row.insertCell();
                cell.innerHTML = csv_row[label] ? csv_row[label] : "-";;
            });
        }
        else {
            ["Artist", "Album", "Genre", "Favorite Songs", "Rating"].forEach(function(label) {
                cell = new_row.insertCell();
                cell.innerHTML = csv_row[label] ? csv_row[label] : "-";
            });
        }
        
        highlight_row_from_rating(new_row, csv_row["Rating"]);
    });

    // Since this should only be called when loading in a CSV for the first time,
    // Defaultly sort by the "Rating" if this is NOT the songs list
    if (SELECTED_LIST != "Favorite Songs") {
        sortTable(4); // 4 == "Rating"
    }
}


// Update what values are shown as the table headers
function updateTableHeaders() {
    header = document.getElementById("table-headers");
    header.innerHTML = "";

    if (SELECTED_LIST == "Favorite Songs") {
        new_row = header.insertRow();
        
        ["Song", "Artist", "Album", "Genre"].forEach(function(label, i) {
            cell = new_row.insertCell();
            cell.innerHTML = "<div class=\"header\">" + label + "<span id=\"header_" + i + "_order\">▲</span> </div>";
            cell.classList.add(label.toLowerCase());
            cell.setAttribute("onclick", "sortTable(" + i + ")");
        });
    }
    else {
        new_row = header.insertRow();

        ["Artist", "Album", "Genre", "Favorite Songs", "Rating"].forEach(function(label, i) {
            cell = new_row.insertCell();
            cell.innerHTML = "<div class=\"header\">" + label + "<span id=\"header_" + i + "_order\">▲</span> </div>";
            cell.classList.add(label.replace(" ", "-").toLowerCase());
            cell.setAttribute("onclick", "sortTable(" + i + ")");
        });
    }
}


// Uses the SELECTED_YEAR and SELECTED_LIST to update the table with the correct data
function updateTable() {
    // Clear the current table
    document.getElementById("album-table-body").innerHTML = "";

    // Load in the new CSV and display the new data
    var extension = getExtensionFromList(SELECTED_LIST);
    var filename = "csv/" + SELECTED_YEAR + extension + ".csv"
    d3.csv(filename).then(function(data) {
        displayCSVData(data);
    });
}


/**************************
**** SORTING FUNCTIONS ****
***************************/
function updateOrderTriangles(active_element) {
    // Make all order arrows default to grayed out triangles pointing up
    document.querySelectorAll("#album-list #table-headers .header span").forEach(span => {
        if (span != active_element){
            span.innerHTML = "▲";
            span.classList.remove("active");
        }
        else {
            active_element.classList.add("active");
        }
    });
}


// Sort the table depending on what header is selected, and if in ascending or descending order
function sortTable(header_index) {
    // Get if it should be sorting in ascending or descending order
    // Get current sorting order and do the opposite
    order = document.getElementById("header_" + header_index + "_order");
    if (order.innerHTML == "▲") {
        tableBubbleSort(header_index, "desc");
        order.innerHTML = "▼";
        updateOrderTriangles(order);
    }
    else {
        tableBubbleSort(header_index, "asc");
        order.innerHTML = "▲";
        updateOrderTriangles(order);
    }
}


// Sort the table depending on what header is selected
function tableBubbleSort(header_index, order) {
    table = document.getElementById("album-table-body");
    rows = table.rows;

    // Fine doing a simple bubble sort since n is always small
    for (i = 0; i < rows.length - 1; i++) {
        
        swapped = false;
        for (j = 0; j < rows.length - i - 1; j++) {
            cell_j0 = rows[j].cells[header_index].innerHTML
            cell_j1 = rows[j + 1].cells[header_index].innerHTML

            // Convert to numbers if the column is numeric
            if (!isNaN(cell_j0) && !isNaN(cell_j1)) {
                cell_j0 = Number(cell_j0);
                cell_j1 = Number(cell_j1);
            }
            
            // Perform the swap depending on if we are in increasing or decreasing order
            if ((order == "desc"  && cell_j1 > cell_j0) || (order == "asc" && cell_j1 < cell_j0)) {
                rows[j].parentNode.insertBefore(rows[j + 1], rows[j]);
                swapped = true;
            }
        }

        if (swapped == false)
            break;
    }
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


// Copy/pasted straight from https://www.w3schools.com/howto/howto_html_include.asp
function includeHTML() {
  var z, i, elmnt, file, xhttp;
  /* Loop through a collection of all HTML elements: */
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    /*search for elements with a certain atrribute:*/
    file = elmnt.getAttribute("w3-include-html");
    if (file) {
      /* Make an HTTP request using the attribute value as the file name: */
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200) {elmnt.innerHTML = this.responseText;}
          if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
          /* Remove the attribute, and call this function once more: */
          elmnt.removeAttribute("w3-include-html");
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