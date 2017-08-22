$(document).ready(function(){
	var getSegment = function (url, index) {
   		return url.replace(/^https?:\/\//, '').split('/')[index];
	};

	function showTaskOnFeed(data){
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
	function showCommentOnFeed(data){
		if (data.error) {
			if (data.error == "not_logged_in") {
				window.location.reload(true);
			}
			else alert(data.error);
				return;
		}
		var template = $('#newComment').html();
		var templateScript = Handlebars.compile(template, {noEscape: true});
		var html = templateScript(data);
		var selector = '.cbox';
		$(selector).append(html);
	}

	$.ajax({
		type: 'GET',
		async: true,
		dataType: 'json',
		url: '/api/task/'+getSegment(window.location.href, 2),
		success: function(res){
			showTaskOnFeed(res);
		}
	});

$('#sComment').click(function(){
		var $commentBody = tinyMCE.activeEditor.getContent({});
		var task = getSegment(window.location.href, 2);
		var newComment = {
			task: task,
			comment_body: $commentBody
		};
		$.ajax({
			type: 'POST',
			async: true,
			data: newComment,
			datatype: 'json',
			url: '/api/newComment',
			success:function(res) {
				showCommentOnFeed(newComment);
			}
		});
	});

});
	