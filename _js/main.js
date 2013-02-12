/**
 * CLEAN THIS CODE UP as I learn more about JQM. Convert all items to use jQuery and not native JS.
 * @author Daniel C. Beacham
 * @date 02.07.13
 * @description - Using JQM to convert VFW Web App into a Mobile Version.  Using Multi-Page Templating
 */

$(function(){
    if(localStorage.length < 1) {
        retrieveData();
    }

    bindButtons();
})

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
    var randomId = $('#add_edit').val() === 'edit' ? $('#add_edit').data('key') : getRandomPlaylistId();
    var itemsArray = ['playlist_name', 'playlist_description', 'playlist_genre', 'playlist_date', 'playlist_priority'];

    for(var i= 0 ; i < itemsArray.length; i++) {
        obj[itemsArray[i]] = $('#' + itemsArray[i]).val();
    }
    obj.enabled = $('input:radio[name=playlist_enabled]:checked').val();

    localStorage.setItem(randomId, JSON.stringify(obj));

    $('<div>').simpledialog2({
        mode: 'button',
        width: 280,
        headerText: 'Save Successful',
        headerClose: false,
        buttonPrompt: 'Your Item has been saved.',
        buttons: {
            'OK' : {
                click: function(){
                    $('#buttonoutput').text('OK');
                },
                theme: "a"
            }
        }
    });
}

/**
 * Displays the selected Data
 */
function displaySelectedData(criteria) {

    var output = "";
    var count = 0;
    for (var i= 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);

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
            output += "<a href='additem.html?edit="  + key + "' data-role='button' data-transition='slidefade'>Edit Playlist</a>";
            output += "<input type='button' value='Delete Playlist' class='btn_delete' data-key='" + key + "'/>";
            output += '</div>';

            count++;
        }
    }

    if(count === 0) {
        output = "<p>There are currently no items in that category</p>";
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
        }
    });
}

function deleteAllData(e) {
    localStorage.clear();
    $('<div>').simpledialog2({
        mode: 'button',
        width: 280,
        headerText: 'Clear Confirmation',
        headerClose: false,
        buttonPrompt: 'Local Storage has been successfully deleted.',
        buttons: {
            'OK' : {
                click: function(){
                    $('#buttonoutput').text('OK');
                },
                theme: "a"
            }
        }
    });
}
function bindButtons() {
    $('#btn_submitPlaylist').live('click', handleFormSubmit);
    $('#btn_deleteAll').live('click', deleteAllData);
    $('.btn_delete').live('click', function(e){
        var key = $(this).data('key');
        localStorage.removeItem(key);

        var parent = $(this).closest('.display_item');
        parent.remove();
    });
}

function populateSearchDiv(results) {
    if ($('#search_results').length == 0) {
        $('<div>', {
            id: 'search_results'
        }).appendTo($('#search_container'));
    }
    //Clear Results Container
    $('#search_results').html('');


    var resultsContainer = $().add('<ul>');

    $.each(results, function(key) {
        $('<li>', {
           html: '<a href="search.html?playlistid=' + results[key].id + '">' + results[key].playlist_name + '</a>'
        }).appendTo(resultsContainer);
    });

    $('#search_results').append(resultsContainer);

    if($('#search_results').is(':hidden')) {
        $('#search_results').slideDown('fast');
    }
}

function runSearchFunction() {
    var curSearchValue = $('#search-basic').val();
    var resultsList = [];

    if (curSearchValue.length <= 2) {
        if ($('#search_results').not(':hidden')) {
            $('#search_results').slideUp('fast');
        }
        return;
    }

    $.each(localStorage, function(i){
       var curKey = localStorage.key(i);
       var item = localStorage.getItem(curKey);

       var parsedItem = $.parseJSON(item);
       var loweredName = parsedItem.playlist_name.toLowerCase();
       var loweredDescription = parsedItem.playlist_description.toLowerCase();

        parsedItem.id = curKey;

       if (loweredName.indexOf(curSearchValue) !== -1 || loweredDescription.indexOf(curSearchValue) !== -1 ) {
           resultsList.push(parsedItem);
       }

    });

   populateSearchDiv(resultsList);
}


function populateSearchResultDetails(id) {
    var tmpItem = $.parseJSON(localStorage.getItem(id));
    var output = '';
    var enabled = tmpItem.enabled == "1" ? "Active" : "Inactive";
    output += "<div class='display_item'>";
    output += "<div class='genreIcon " + tmpItem.playlist_genre +"'>" + tmpItem.playlist_genre + " ICON</div>";
    output += "<p><strong>Name: </strong> " + tmpItem.playlist_name +  "</p>";
    output += "<p><strong>Description: </strong>" + tmpItem.playlist_description + "</p>";
    output += "<p><strong>Genre: </strong>" + tmpItem.playlist_genre + "</p>";
    output += "<p><strong>Created: </strong>" + tmpItem.playlist_date + "</p>";
    output += "<p><strong>Priority: </strong>" + tmpItem.playlist_priority + "</p>";
    output += "<p><strong>Status: </strong>" + enabled + "</p>";
    output += "<a href='additem.html?edit='"  + id + "' data-role='button' data-transition='slidefade'>Edit Playlist</a>";
    output += "<input type='button' value='Delete Playlist' class='btn_delete' data-key='" + key + "'/>";
    output += '</div>';

    $('#results_detail').html(output);

}

function prepopulateEditForm(id) {
    var item = $.parseJSON(localStorage.getItem(id));
    $('#playlist_name').val(item.playlist_name);
    $('#playlist_description').val(item.playlist_description);
    $('#playlist_date').val(item.playlist_date);
    $('#playlist_priority').val(item.playlist_priority);

    var radios = $('input:radio[name=playlist_enabled]');

    radios.filter('[value=' + item.enabled + ']')
        .attr('checked', true)
        .end()
        .checkboxradio("refresh");

    $('#playlist_genre').find('option')
        .filter('[value=' + item.playlist_genre + ']')
        .attr('selected',true);
    $('#playlist_genre').selectmenu("refresh", true);

    $('#btn_submitPlaylist').attr('value', 'Edit Playlist').button("refresh");
    $('#add_edit').val('edit').data('key', id);
}

$('#home').live('pageshow', function (event) {
    $('#search-basic').keyup(function(evt){
       runSearchFunction();
    });

    $('.ui-input-search').find('.ui-icon-delete').click(function(evt){
        var results = $('#search_results');

        if (results.is(':visible')) {
            results.slideUp('fast');
        }
    });

});

$('#browse').live('pageshow', function (event) {
    var criteria = $(this).data('url').split("?")[1];
    var cId = criteria.replace("criteria=", "");
    displaySelectedData(cId);
    $(this).page("destroy").page();
});

$('#additem').live('pageshow', function (event) {

    if ($(this).data('url').indexOf('?') !== -1) {
        var edit = $(this).data('url').split("?")[1];
        var editId = edit.replace("edit=", "");
        prepopulateEditForm(editId);
    }

    $('#error_confirmation').html('').hide();
});

$('#search').live('pageshow', function(event) {
   var playlist = $(this).data('url').split("?")[1];
   var pId = playlist.replace("playlistid=", "");
   populateSearchResultDetails(pId);
   $(this).page("destroy").page();
});