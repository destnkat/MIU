function getRandomPlaylistId() {
    return Math.floor(Math.random() * (1000 - 1 + 1)) + 1;
}

function populateLocalStorage() {
    var dummyDataLoaded = false;

    if(localStorage.length == 0 ){
        var dummyData = json.playlists;

        for (var i = 0; i < dummyData.length; i++) {
            var playlistID = getRandomPlaylistId();
            var consolidated = JSON.stringify(dummyData[i]);
            localStorage.setItem(playlistID, consolidated);
        }

        dummyDataLoaded = true;
    }

    displayTheData();
}

function getDisplayCriteria(param) {
    var url = window.location.search.substring(1);
    var parameters = url.split('&');
    for (var i = 0; i < parameters.length; i++)
    {
        var parameterKey = parameters[i].split('=');
        if (parameterKey[0] == param)
        {
            return parameterKey[1];
        }
    }

    return false;
}

function passesFilter(criteria, json) {
    if ((criteria === 'country' && json.playlist_genre.toLowerCase() === 'country') ||
        (criteria === 'rap' && json.playlist_genre.toLowerCase()  === 'rap') ||
        (criteria === 'dubstep' && json.playlist_genre.toLowerCase()  === 'dubstep') ||
        (criteria === 'pop' && json.playlist_genre.toLowerCase()  === 'pop') ||
        (criteria === 'inactive' && json.enabled.toLowerCase()  === '0') ||
        (criteria === 'high_priority' && json.playlist_priority > 75)
        ) {
        return true;
    }

    return false;
}

function displayTheData() {
    var criteria           = getDisplayCriteria('criteria');
    var container          = document.getElementById('browse_data');
    var categoryContainer  = document.getElementById('category_label_id');
    var output             = "";

    if (criteria) {
        for(var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            var value = JSON.parse(localStorage[key]);

            if(passesFilter(criteria, value)) {
                var enabled = value.enabled == "1" ? "Active" : "Inactive";
                output += "<div class='display_item'><div class='genreIcon " + value.playlist_genre +"'>" + value.playlist_genre + " ICON</div>";
                output += "<p><strong>Name: </strong> " +value.playlist_name +  "</p>";
                output += "<p><strong>Description: </strong>" + value.playlist_description + "</p>";
                output += "<p><strong>Genre: </strong>" + value.playlist_genre + "</p>";
                output += "<p><strong>Created: </strong>" + value.playlist_date + "</p>";
                output += "<p><strong>Priority: </strong>" + value.playlist_priority + "</p>";
                output += "<p><strong>Status: </strong>" + enabled + "</p>";
                output += "<div class='playlist_control_buttons'>";
                output += "<input type='button' value='edit' onclick='editLocalStorageItem(this.id);' id='edit_" + key + "' />";
                output += "<input type='button' value='delete' onclick='deleteLocalStorageItem(this.id);' id='delete_" + key + "' /></div></div>";
            }
        }

       categoryContainer.innerHTML = criteria;
       container.innerHTML = output;
    }
}

function bindAllButtons() {
    var btnAdd = document.getElementById('btn_addPlaylist');

    if(btnAdd) {
        btnAdd.addEventListener('touchstart', test, false);
    }
}

function test(e) {
    console.log('test');
}

function init(pg) {
    bindAllButtons();

    if(pg === 'display') {
        populateLocalStorage();
    }
}