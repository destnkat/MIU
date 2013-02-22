$('#home').on('pageinit', function(){
    getData();
    bindBrowseButtons();

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

$('#info').on('pageshow', function(){
   checkAndRemoveEdit();
});

$('#home').on('pageshow', function(){
    checkAndRemoveEdit();
});

$('#browse').on('pageshow', function(){
    checkAndRemoveEdit();
});

$('#additem').on('pageshow', function(){
	//Bind a Reset Button 
	$('#reset_form').on('click', function(e) {
		resetForm();
	});
	
	if (localStorage.getItem('edit') != null) {
		autofillData();
	} else {
        resetForm();
		populateDate();
	}
    var myForm = $('#frm_addItem');
    
    myForm.validate({
    	ignore: ".ignore",
        invalidHandler: function(form, validator) {
        },
        submitHandler: function() {
            var data = myForm.serializeArray();
            storeData(data);
        }
    });
});

$('#browse').on('pageshow', function(){
	checkAndRemoveEdit();
    displaySelectedData();
    bindControlButtons();
    $(this).page("destroy").page();
});

//The functions below can go inside or outside the pageinit function for the page in which it is needed.

var autofillData = function (){
	var editId = localStorage.getItem('edit');
	var items = $.parseJSON(localStorage.getItem('playlists'));
	
	for (var i=0; i < items.length; i++) {
		if (items[i].playlist_id == editId) {
			$('#playlist_name').val(items[i].playlist_name);
			$('#playlist_description').val(items[i].playlist_description);
			$('#playlist_date').val(items[i].playlist_date);
			$('#playlist_priority').val(items[i].playlist_priority).slider('refresh');
			setSelectValue('playlist_genre', items[i].playlist_genre);
			$('#playlist_enabled').val(items[i].playlist_enabled).slider('refresh');
			
			break;		
		}
	}
};

var setSelectValue = function(whichSelect, value) {
    var $select = $('#' + whichSelect);
	var curSelection = $select.find('option[value="' + value + '"]');
	curSelection.attr('selected', true);
	$select.selectmenu('refresh');
		
};

var getData = function(){
    if (localStorage.getItem('playlists') !== null ) {
        return;
    }

    for(var i = 0; i < json.playlists.length; i++) {
        json.playlists[i].playlist_id = getRandomPlaylistId();
    }

    localStorage.setItem('playlists', JSON.stringify(json.playlists));
};

var storeData = function(data){
	var cleanedObj = {};
	var editValue = localStorage.getItem('edit');

	cleanedObj.playlist_id =  editValue === null ? getRandomPlaylistId() : editValue; 
	
	for (var i = 0; i < data.length; i++) {
		var name = data[i].name;
		var value = data[i].value;
		
		cleanedObj[name] = value;
	}
	 
	appendCurrentInventory(cleanedObj);

};

var bindControlButtons = function() {

	$('.btn_edit').on('click', function(e) {
		localStorage.setItem('edit', $(this).data('key'));
		$.mobile.changePage('#additem');
	});
	
	$('.btn_delete').on('click', function(e) {
	    deleteItem($(this).data('key'));
	});

    $('#btn_deleteAll').on('click', clearLocal);
};

var appendCurrentInventory = function(newObject) {
	
	var currentInventory = $.parseJSON(localStorage.getItem('playlists'));
    var $modal = $('#confirmation_modal');
    var $trigger = $('#confirmation_trigger');
    var modalHeader = 'New Item Stored';
    var modalContent = "<p>Your New Playlist has been successfully added to localStorage! Wahooooo!</p>";

    $modal.find('.modalHeader').text('Local Storage Deleted');
    $modal.find('.modalContent').html('<p>Your I</p>');
	
	if (localStorage.getItem('edit') != null) {

        modalHeader = "Playlist Edited";
        modalContent = "<p>Your Playlist has been successfully edited</p>";
        
		for (var i = 0; i < currentInventory.length; i++) {
			if (currentInventory[i].playlist_id == newObject.playlist_id) {
			
				currentInventory[i].playlist_name        = newObject.playlist_name;
				currentInventory[i].playlist_description = newObject.playlist_description;
				currentInventory[i].playlist_date = newObject.playlist_date;
				currentInventory[i].playlist_priority = newObject.playlist_priority;
				currentInventory[i].playlist_genre = newObject.playlist_genre;
				currentInventory[i].playlist_enabled = newObject.playlist_enabled;
				checkAndRemoveEdit();
				break;
			}
		}
	} else {
		currentInventory.push(newObject);
	}
	
	localStorage.setItem('playlists', JSON.stringify(currentInventory));

	$trigger.click();
    $modal.find('.modalHeader').text(modalHeader);
    $modal.find('.modalContent').html(modalContent);
	resetForm();
};

var	deleteItem = function (key){
	var currentInventory = $.parseJSON(localStorage.getItem('playlists'));
	
	for (var i = 0; i < currentInventory.length; i++) {
		if (currentInventory[i].playlist_id == key) {
			currentInventory.splice(i, 1);
			break;
		}
	}
		
	localStorage.setItem('playlists', JSON.stringify(currentInventory));
	$('#success_trigger').click();
};

var clearLocal = function(e){
    var $modal = $('#confirmation_modal');
    var $trigger = $('#confirmation_trigger');

    $modal.find('.modalHeader').text('Local Storage Deleted');
    $modal.find('.modalContent').html('<p>Your Local Storage has been successfully cleared</p>');

	localStorage.clear();

    $trigger.click();
    $('#browse').page('destroy').page();
};

//Custom Form because default reset doesnt not honor default values
var resetForm = function() {
	document.getElementById('frm_addItem').reset();
	populateDate();
	$('#playlist_genre').find('option:first-child').attr('selected', true).end().selectmenu('refresh');
	$('#playlist_priority').slider('refresh');	
}

var populateDate = function() {
		var now = new Date();
		var month = now.getMonth() + 1;
		var day = now.getDate();
		
		if (month < 10) {
			month = "0" + month;
		}
		
		if (day < 10) {
			day = "0" + day;
		}
		
		var today = now.getFullYear() + '-' + month + '-' + day;
		
		$('#playlist_date').val(today);
}

var bindBrowseButtons = function() {
   $('#list_browse').find('li').find('a').on('click', function(e){
        localStorage.setItem('criteria', $(this).data('criteria'));
    });

    $('.btn_browse').on('click', function(e){
        localStorage.setItem('criteria', $(this).data('criteria'));
    });
}

var getRandomPlaylistId = function() {
    return Math.floor(Math.random() * (1000 - 1 + 1)) + 1;
};

var sortArray = function(a, b) {
    var aPriority = parseInt(a.playlist_priority, 10);
    var bPriority = parseInt(b.playlist_priority, 10);

    return (aPriority > bPriority) ? -1 : (aPriority < bPriority) ? 1 : 0;
}

var displaySelectedData = function() {
    var arr = [];
    var criteria = localStorage.getItem('criteria');
    var playlistsRaw = localStorage.getItem('playlists');
    var playlistsClean = [];

    if (playlistsRaw != null) {
         playlistsClean = $.parseJSON(playlistsRaw);
    }

    for (var i= 0; i < playlistsClean.length; i++) {
        var tmpItem = playlistsClean[i];

        if ((criteria === 'country' && tmpItem.playlist_genre.toLowerCase() === 'country') ||
            (criteria === 'rap' && tmpItem.playlist_genre.toLowerCase()  === 'rap') ||
            (criteria === 'dubstep' && tmpItem.playlist_genre.toLowerCase()  === 'dubstep') ||
            (criteria === 'pop' && tmpItem.playlist_genre.toLowerCase()  === 'pop') ||
            (criteria === 'inactive' && tmpItem.enabled.toLowerCase()  === '0') ||
            (criteria === 'high_priority' && tmpItem.playlist_priority > 75) ||
            (criteria === 'all')
            ) {
            arr.push(tmpItem);
        }
    }

    arr.sort(sortArray);
    displayData(arr);
};

var displayData = function(arr) {
    var output = "<div data-role='collapsible-set'>";
    var count = 0;

    for(var i = 0; i < arr.length; i++) { 
        var tmpItem = arr[i];
        var enabled = tmpItem.enabled == "1" ? "Active" : "Inactive";
        output += "<div class='display_item' data-role='collapsible' data-icon='' data-iconpos='right' data-theme='a'>";
        output += "<h3><img src='_images/thumb_" + tmpItem.playlist_genre + ".png' width='30' alt=''/></strong> " + tmpItem.playlist_name +  "</h3>";
        output += "<ul data-role='listview'><li><strong>Description: </strong>" + tmpItem.playlist_description + "</li>";
        output += "<li><strong>Genre:</strong> " + tmpItem.playlist_genre + "</li>";
        output += "<li><strong>Created</strong>: " + tmpItem.playlist_date + "</li>";
        output += "<li><strong>Priority:</strong> " + tmpItem.playlist_priority + "</li>";
        output += "<li><strong>Status:</strong> " + enabled + "</li>";
        output += "<li><input type='button' value='Edit Playlist' class='btn_edit' data-mini='true' data-key='" + tmpItem.playlist_id + "' />";
        output += "<input type='button' value='Delete Playlist' class='btn_delete' data-mini='true' data-key='" + tmpItem.playlist_id + "'/></li></ul>";
        output += '</div>';

        count++;
    }
    output += "</div>";
    if (count === 0 ) {
        output = "<p>Currently No Items in this category</p>"
    }

    $('#browse_results').html(output);
};

var checkAndRemoveEdit = function() {
	if (localStorage.getItem('edit') != null) {
		localStorage.removeItem('edit');
	}	
};
