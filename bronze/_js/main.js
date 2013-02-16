/**
 * CLEAN THIS CODE UP as I learn more about JQM. Convert all items to use jQuery and not native JS.
 * @author Daniel C. Beacham
 * @date 02.07.13
 * @description - Using JQM to convert VFW Web App into a Mobile Version.  Using Multi-Page Templating
 */

$(function(){
    if(localStorage.length < 1) {
        deleteAllData();
    }

    retrieveData();

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

    var arr = [];

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
                tmpItem.key = key;
                arr.push(tmpItem);
        }
    }

    arr.sort(sortArray);
    displayData(arr);
}

function displayData(arr) {
    var output = "<ul data-role='listview'>";
    var count = 0;

    for(var i = 0; i < arr.length; i++) {
        var tmpItem = arr[i];

         output += "<li>";
         output += "<a href='search.html?playlistid=" + tmpItem.key + "'>";
         output += "<img src='_images/thumb_" + tmpItem.playlist_genre + ".png' alt=''/>";
         output += "<h3>" + tmpItem.playlist_name +  "</h3>";
         output += "<p>" + tmpItem.playlist_genre + "</p>";
         output += '</a></li>';

         count++;
    }
    output += "</div>";
    if (count === 0 ) {
        output = "<p>Currently No Items in this category</p>"
    }

    $('#browse_results').html(output);
}

function sortArray(a, b) {
    var aPriority = parseInt(a.playlist_priority, 10);
    var bPriority = parseInt(b.playlist_priority, 10);

    return (aPriority > bPriority) ? -1 : (aPriority < bPriority) ? 1 : 0;
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
    $('.btn_edit').live('click', function(e){
        var key = $(this).data('key');
        $.mobile.changePage('addItem.html?edit=' + key);

    });

    $('.btn_delete').live('click', function(e){
        var key = $(this).data('key');
        localStorage.removeItem(key);

        var parent = $(this).closest('.display_item');
        parent.remove();

        $('#content').find('ul').listview('refresh');
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
    var output = "<div data-role='collapsible-set'>";
    var enabled = tmpItem.enabled == "1" ? "Active" : "Inactive";
    output += "<div class='display_item' data-role='collapsible' data-collapsed='false' data-iconpos='right' data-theme='a'>";
    output += "<h3><img src='_images/thumb_" + tmpItem.playlist_genre + ".png' width='30' alt=''/></strong> " + tmpItem.playlist_name +  "</h3>";
    output += "<ul data-role='listview'><li><strong>Description: </strong>" + tmpItem.playlist_description + "</li>";
    output += "<li><strong>Genre:</strong> " + tmpItem.playlist_genre + "</li>";
    output += "<li><strong>Created</strong>: " + tmpItem.playlist_date + "</li>";
    output += "<li><strong>Priority:</strong> " + tmpItem.playlist_priority + "</li>";
    output += "<li><strong>Status:</strong> " + enabled + "</li>";
    output += "<li><input type='button' value='Edit Playlist' class='btn_edit' data-key='" + tmpItem.key + "'/>";
    output += "<input type='button' value='Delete Playlist' class='btn_delete' data-key='" + tmpItem.key + "'/></li></ul>";
    output += '</div></div>';

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