/**
 * CLEAN THIS CODE UP as I learn more about JQM. Convert all items to use jQuery and not native JS.
 * @author Daniel C. Beacham
 * @date 02.07.13
 * @description - Using JQM to convert VFW Web App into a Mobile Version.  Using Multi-Page Templating
 */

function getRandomPlaylistId() {
    return Math.floor(Math.random() * (1000 - 1 + 1)) + 1;
}

/**
 * Form Handler for the AddItem Page
 * @param e
 */
function handleFormSubmit(e){
    e.preventDefault();
    var obj = {};
    var randomId = getRandomPlaylistId();
    var itemsArray = ['playlist_name', 'playlist_description', 'playlist_genre', 'playlist_date', 'playlist_priority'];
    var error;
    var confirmationContainer = $('#error_confirmation');
    for(var i= 0 ; i < itemsArray.length; i++) {
        obj[itemsArray[i]] = $('#' + itemsArray[i]).val();
    }
    obj.enabled = $('input:radio[name=playlist_enabled]:checked').val();

    localStorage.setItem(randomId, JSON.stringify(obj));

    //Clear the form
    $(':input','#frm_addItem')
        .not(':button, :submit, :reset, :hidden')
        .val('')
        .removeAttr('checked')
        .removeAttr('selected');

    confirmationContainer.html('<p>Your Item has been successfully Added to localStorage</p>')
                         .show();
}

/**
 * Displays the selected Data
 */
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

function deleteLocalStorageItem(key) {
    var delim = key.indexOf('_');
    var cleanId = key.substring(delim + 1, key.length);
    localStorage.removeItem(cleanId);

    displaySelectedData();
}

function bindButtons() {
    $('#btn_submitPlaylist').live('click', handleFormSubmit);
    $('#btn_displayAll').live('click', function(e){
        e.preventDefault();
        localStorage.setItem('criteria', $(this).data('criteria'));
    })
}

$('#home').live('pageshow', function (event) {
    $('#list_browse').find('li').each(function () {
        $(this).find('a').click(function () {
            localStorage.setItem('criteria', $(this).data('criteria'));
        });
    });
});

$('#browse').live('pageshow', function (event) {
    if (localStorage.length < 2 ){ //todo: Tie to Key Name
        retrieveData();
    } else {
        displaySelectedData();
    }
});

$('#additem').live('pageshow', function (event) {
    bindButtons();
    $('#error_confirmation').html('').hide();
});