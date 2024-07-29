// Dummy print function to display a string on the website itself
function print(str) {
    var printer = document.getElementsByClassName("printer")[0];
    printer.innerHTML = str;
}

// Detects when one of the "Year-Menu" elements is clicked on
document.getElementById("year-menu").addEventListener("click", function(event) {
    print(event.target.innerHTML);

    // TODO: When a year is clicked on, load in the new CSV for that corresponding year
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
    // output.textContent = JSON.stringify(data, null, 2);
    
    // Loop through each entry (which is an album)
    data.forEach(function(csv_row, r) {
        new_row = table.insertRow(-1);
        album_art = new_row.insertCell(-1);
        artist = new_row.insertCell(-1);
        album = new_row.insertCell(-1);
        genre = new_row.insertCell(-1);
        favorite_songs = new_row.insertCell(-1);
        rating = new_row.insertCell(-1);

        album_art.innerHTML = "-"
        artist.innerHTML = csv_row["Artist"]
        album.innerHTML = csv_row["Album"]
        genre.innerHTML = csv_row["Genre"]
        favorite_songs.innerHTML = csv_row["Favorite Songs"]
        rating.innerHTML = csv_row["Rating"]
    });
}
