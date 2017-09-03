var current_user = null;
var taskForCommentData = null;

$(document).ready(function(){

	function modifyCssByData(data){
		$('.btncontainer div.button').removeClass('active');
		if (!data.is_assignee && data.task.creator._id.toString() != current_user._id.toString()){
				return;
		}
		else if (data.is_assignee || data.task.creator._id.toString() === current_user._id.toString()){
			if (data.task.status === 'new' && data.is_assignee === true) {
				$('.btncontainer .start').addClass('active');
			}
			else if (data.task.status === 'started' && data.is_assignee === true){
				$('.btncontainer .finish').addClass('active');
			}
			else if (data.task.status === 'finished' && data.is_assignee === true){
				$('.btncontainer .finished').addClass('active');
			}
			else if (data.task.status === 'finished' && data.task.creator._id.toString() === current_user._id.toString()){
				$('.btncontainer .accept').addClass('active');
				$('.btncontainer .reject').addClass('active');
			}
			else if (data.task.status === 'rejected' && data.is.assignee){
				$('.btncontainer .rejected').addClass('active');
			}
		}
	}
	

	var getSegment = function (url, index) {
   		return url.replace(/^https?:\/\//, '').split('/')[index];
	};

	function showTaskOnFeed(data){
		$('.dimmer').removeClass('active');
		if (data.error) {
			if (data.error == "not_logged_in") {
				window.location.reload(true);
			}
			else {
				alert(data.error);
			}			
			return;
		}

		// one time values
		$('#task_title').text(data.task.title || "Unknown");
		$('#task_id').text('#'+data.task._id || "Unknown");
		$('#task_status').text(data.task.status || "Unknown");
		$('#task_creator').text(data.task.creator.first_name + " " + data.task.creator.last_name);

		// repeat for each comment and render as one HTML
		render_comments(data.task);
		
	}

	function render_comments(item){
		var template = $('#comment_template').html();
		var templateScript = Handlebars.compile(template, {noEscape: true});
		var html = templateScript(item);
		$('#comments_cont').append(html);
	};

	$.ajax({
		type: 'GET',
		async: true,
		dataType: 'json',
		url: '/api/task/'+getSegment(window.location.href, 2),
		success: function(res){
			current_user = res.current_user;
			taskForCommentData = res.task;
			showTaskOnFeed(res);
			modifyCssByData(res);

		}
	});

$('#sComment').click(function(){
		var $commentBody = tinyMCE.activeEditor.getContent({});
		var task_id = getSegment(window.location.href, 2);
		var new_comm = {
			task_id: task_id,
			title: $commentBody,
			creator:{ 
				first_name: current_user.first_name,
				last_name: current_user.last_name,
			},
			created_ts: "just now"
		};

		var item = {
			comments: [new_comm]
		};
		render_comments(item);

		$.ajax({
			type: 'POST',
			async: true,
			data: new_comm,
			datatype: 'json',
			url: '/api/newComment',
			success:function(res){
			
			}
		});
	});

});
	