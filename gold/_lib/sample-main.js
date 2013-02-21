$('#home').on('pageinit', function(){
    retrieveData();
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

$('#additem').on('pageinit', function(){
	//Bind a Reset Button 
	$('#reset_form').on('click', function(e) {
		resetForm();
	});
	
	populateDate();
	
    var myForm = $('#frm_addItem');
    var errorLink = $('#error_trigger');
    
    
    myForm.validate({
    	ignore: ".ignore",
        invalidHandler: function(form, validator) { console.log(validator.submitted);
        	errorLink.click();
        	var output ='';
        	for (var key in validator.submitted) {
	        	var label = $('label[for^="' + key + '"]');
	        	
	        	var cleanedLabel = label.text().replace(/[*:]/g, '');
	        	output += '<li>' + cleanedLabel + '</li>';
        	}
        	
        	$('#form_error').find('ul').html(output);
        },
        submitHandler: function() {
            var data = myForm.serializeArray();
            storeData(data);
        }
    });

    //any other code needed for addItem page goes here

});

$('#browse').on('pageshow', function(){
    displaySelectedData();
    $(this).page("destroy").page();
});

//The functions below can go inside or outside the pageinit function for the page in which it is needed.

var autofillData = function (){

};

var getData = function(){

};

var storeData = function(data){
	var cleanedObj = {};
	var editValue = localStorage.getItem('edit');
	var newString;
	var stringObj;

	cleanedObj.playlist_id =  editValue === null ? getRandomPlaylistId() : editValue; 
	
	for (var i = 0; i < data.length; i++) {
		var name = data[i].name;
		var value = data[i].value;
		
		cleanedObj[name] = value;
	}
	 
	appendCurrentInventory(cleanedObj);

};

var appendCurrentInventory = function(newObject) {
	var currentInventory = $.parseJSON(localStorage.getItem('playlists'));
	
	currentInventory.push(newObject);
	localStorage.setItem('playlists', JSON.stringify(currentInventory));
	$('#success_trigger').click();
	resetForm();
};

var	deleteItem = function (){

};

var clearLocal = function(){
	localStorage.clear();
};

//Custom Form because default reset doesnt not honor default values
var resetForm = function() {
	document.getElementById('frm_addItem').reset();
	populateDate();
	$('#playlist_genre').find('option:first-child').attr('selected', true).end().selectmenu('refresh');
	$('#playlist_priority').slider('refresh');	
}

var populateDate = function() {
	if (localStorage.getItem('addEdit') !== 'edit') {
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
}

var bindBrowseButtons = function() {
   $('#list_browse').find('li').find('a').on('click', function(e){
        localStorage.setItem('criteria', $(this).data('criteria'));
    });
}

var getRandomPlaylistId = function() {
    return Math.floor(Math.random() * (1000 - 1 + 1)) + 1;
}

var retrieveData = function(){
    if (localStorage.getItem('playlists') !== null ) {
        return;
    }

    for(var i = 0; i < json.playlists.length; i++) {
        json.playlists[i].id = getRandomPlaylistId();
    }

    localStorage.setItem('playlists', JSON.stringify(json.playlists));
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
    var playlistsClean = $.parseJSON(playlistsRaw);


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
        output += "<li><input type='button' value='Edit Playlist' class='btn_edit' data-key='" + tmpItem.key + "'/>";
        output += "<input type='button' value='Delete Playlist' class='btn_delete' data-key='" + tmpItem.key + "'/></li></ul>";
        output += '</div>';

        count++;
    }
    output += "</div>";
    if (count === 0 ) {
        output = "<p>Currently No Items in this category</p>"
    }

    $('#browse_results').html(output);
};
