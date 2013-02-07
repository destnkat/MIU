/**
 * @todo CLEAN THIS CODE UP as I learn more about JQM. Convert all items to use jQuery and not native JS.
 * @author Daniel C. Beacham
 * @date 02.07.13
 * @description - Using JQM to convert VFW Web App into a Mobile Version.  Using Multi-Page Templating
 */
$('#home').live('pageshow', function(event){
    $('#list_browse').find('li').each(function(){
       $(this).find('a').click(function(){
           localStorage.setItem('criteria', $(this).data('criteria'));
       });
    });
});

$('#browse').live('pageshow', function(event){
    if (localStorage.length < 2 ){
        retrieveData();
    } else {
        displaySelectedData();
    }
});

$('#addItem').live('pageshow', function(event){

});

function getRandomPlaylistId() {
    return Math.floor(Math.random() * (1000 - 1 + 1)) + 1;
}

function retrieveData() {
    var storageObj = {};
    storageObj.playlists = [];

    $.ajax({
        url: '_js/json.json',
        success: function(data) {
            for(var i = 0; i < data.playlists.length; i++) {
                var playlistID = getRandomPlaylistId();
                var consolidated = JSON.stringify(data.playlists[i]);
                localStorage.setItem(playlistID, consolidated);
            }

            displaySelectedData();
        }
    });
}

function displaySelectedData() {
    var criteria = localStorage.getItem('criteria');
    var output = "";
    for (var i= 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);

        //Disregard the Criteria LS Item
        if(key === 'criteria') {
            continue;
        }

        var tmpItem = $.parseJSON(localStorage[key]);

        if ((criteria === 'country' && tmpItem.playlist_genre.toLowerCase() === 'country') ||
            (criteria === 'rap' && tmpItem.playlist_genre.toLowerCase()  === 'rap') ||
            (criteria === 'dubstep' && tmpItem.playlist_genre.toLowerCase()  === 'dubstep') ||
            (criteria === 'pop' && tmpItem.playlist_genre.toLowerCase()  === 'pop') ||
            (criteria === 'inactive' && tmpItem.enabled.toLowerCase()  === '0') ||
            (criteria === 'high_priority' && tmpItem.playlist_priority > 75) ||
            (criteria === 'all')
            ) {
            var enabled = tmpItem.enabled == "1" ? "Active" : "Inactive";
            output += "<div class='display_item'>";
            output += "<div class='genreIcon " + tmpItem.playlist_genre +"'>" + tmpItem.playlist_genre + " ICON</div>";
            output += "<p><strong>Name: </strong> " + tmpItem.playlist_name +  "</p>";
            output += "<p><strong>Description: </strong>" + tmpItem.playlist_description + "</p>";
            output += "<p><strong>Genre: </strong>" + tmpItem.playlist_genre + "</p>";
            output += "<p><strong>Created: </strong>" + tmpItem.playlist_date + "</p>";
            output += "<p><strong>Priority: </strong>" + tmpItem.playlist_priority + "</p>";
            output += "<p><strong>Status: </strong>" + enabled + "</p>";
            output += "<input type='button' value='edit playlist' onclick='editLocalStorageItem(this.id);' id='edit_" + key + "' />";
            output += "<input type='button' value='delete playlist' onclick='deleteLocalStorageItem(this.id);' id='delete_" + key + "' />";
            output += '</div>';
        }
    }

    $('#browse_results').html(output);
}

function getRandomPlaylistId() {
    return Math.floor(Math.random() * (1000 - 1 + 1)) + 1;
}

function deleteLocalStorageItem(key) {
    var delim = key.indexOf('_');
    var cleanId = key.substring(delim + 1, key.length);
    localStorage.removeItem(cleanId);

    displaySelectedData();
}