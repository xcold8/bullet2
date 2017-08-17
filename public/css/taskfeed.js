$(document).ready(function(){
	var getSegment = function (url, index) {
   		return url.replace(/^https?:\/\//, '').split('/')[index];
	};

	function showDataOnFeed(data){
		console.log(typeof data);
		if (data.error) {
			if (data.error == "not_logged_in") {
				window.location.reload(true);
			}
			else alert(data.error);
				return;
			}
		var template = $('#taskfeed').html();
		var templateScript = Handlebars.compile(template, {noEscape: true});
		var html = templateScript(data);
		var selector = '.task_item';
		$(selector).append(html);
	}

	$.ajax({
		type: 'GET',
		async: true,
		dataType: 'json',
		url: '/api/task/'+getSegment(window.location.href, 2),
		success: function(res){
			showDataOnFeed(res);
		}
	});

});