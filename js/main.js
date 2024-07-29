// Dummy print function to display a string on the website itself
function print(str) {
    var printer = document.getElementsByClassName("printer")[0];
    printer.innerHTML = str;
}


// Detects when one of the "Year-Menu" elements is clicked on
document.getElementById("year-menu").addEventListener("click", function(event) {
    print(event.target.innerHTML);

    // Clear the current table
    document.getElementById("album-table-body").innerHTML = "";

    // TODO: If this year does not exist, print a notice

    // Load in the new CSV and display the new data
    var year = event.target.innerHTML;
    d3.csv("csv/" + year + ".csv").then(function(data) {
        displayData(data);
    });

    // TODO: When an "◀" or "▶" is clicked on, shift the year list
    // TODO: Make the only years that show be the years I have reviews for
    // TODO: Make the "◀" or "▶" buttons gray out and not work when there are no more years to scroll to
});


// Loads newest CSV by default
d3.csv("csv/2024.csv").then(function(data) {
    displayData(data);
});


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
        artist.innerHTML = csv_row["Artist"];
        album.innerHTML = csv_row["Album"];
        genre.innerHTML = csv_row["Genre"];
        favorite_songs.innerHTML = csv_row["Favorite Songs"];
        rating.innerHTML = csv_row["Rating"];
    });

    // TODO: Add row highlighting depending on rating
}
