var current_user = null;
var taskForCommentData = null;

$(document).ready(function(){
	function load_task_data(){
		$('.dimmer').addClass('active');
			$.ajax({
				type: 'GET',
				async: true,
				dataType: 'json',
				url: '/api/task/'+getSegment(window.location.href, 2),
				success: function(res){
					current_user = res.current_user;
					showTaskOnFeed(res);
					var button_selector = modifyCssByData(res);
					var assignees_selector = getAssigneesSelector(res);
					$(button_selector).addClass('active');
					$(assignees_selector).addClass('active');
					showUserInDropdown(res);
					$('.dimmer').removeClass('active');
				}
			});
	}

	//shows the current active users selected in dropdown
	function showUserInDropdown(data){
		var wrapper = data.task;
		$.get('/api/getUsers', function(all_users){
			var wrapperinho = {objects: all_users};
			var usertmpl = $('#allindropdown').html();
			var tmplScript = Handlebars.compile(usertmpl);
			var html_con = tmplScript(wrapperinho);
			$('#assigned_tview').append(html_con);
			for (var i=0; i<wrapperinho.objects.length; i++){
				for (var j=0;j<wrapper.assignees.length; j++){
					if (wrapperinho.objects[i]._id.toString() == wrapper.assignees[j]._id.toString()){
						$('#assigned_tview').dropdown('set selected', wrapperinho.objects[i].first_name);
						$('.assignee_btn').html('Assignees: <div class="ui teal label">'+wrapperinho.objects[i].first_name+'</div>');
					}
				}
			}
			$('#assigned_tview').dropdown('refresh');
		});
	}



	function modifyCssByData(data){
		$('.btncontainer div.button').removeClass('active');
		if (!data.is_assignee && !data.is_creator){
				return;
		}
		else if (data.is_assignee || data.is_creator){
			if (data.task.status === 'new' && data.is_assignee) {
				return '.btncontainer .newt .assignee';
			}
			if (data.task.status === 'started' && data.is_assignee){
				return '.btncontainer .startedt .assignee';
			}
			if (data.task.status === 'finished' && data.is_assignee){
				return '.btncontainer .finishedt .assignee';
			}
			if (data.task.status === 'finished' && data.is_creator){
				return '.btncontainer .finishedt .creator';
			}
			if (data.task.status === 'rejected' && data.is_assignee){
				return '.btncontainer .rejectedt .assignee';
			}
			if (data.task.status === 'rejected' && data.is_creator){
				return '.btncontainer .rejectedt .creator';
			}
			if (data.task.status ==='accepted' && (data.is_assignee || data.is_creator)){
				return '.btncontainer .acceptedt div.label';
			}
		}
	}

	function getAssigneesSelector(data){
		$('.assignees_btn_container').removeClass('active');
		if (!data.is_assignee && !data.is_creator){
			return;
		}
		else if (data.is_assignee || data.is_creator){
			if (data.is_creator){
				return '.assignees_btn_container .creator_btn';
			}
			else {
				if (data.is_assignee){
					return '.assignees_btn_container .assignee_btn';
				}
			}
		}
	}
		//Actions buttons jquery onclick
	function postActionToSrv(task_id,action_name){
		idx = 0;
		$('.dimmer').addClass('active');
		$.post('/api/task/'+task_id+'/action/', {action: action_name}, function(res){
			if (res.status && res.status == "OK") {
				if (res.new_task_status) {
					load_task_data();
				}
				else {
					window.location.reload(true);
				}
			}
			else {
				alert("Error sending action: " + res.error);
			}
	 	});
	}

	var getSegment = function (url, index) {
   		return url.replace(/^https?:\/\//, '').split('/')[index];
	};
	function render_comments(item){
		var template = $('#comment_template').html();
		var templateScript = Handlebars.compile(template, {noEscape: true});
		var html = templateScript(item);
		$('#comments_cont').append(html);
	}
	$('#t_start').click(function(){
		postActionToSrv(getSegment(window.location.href, 2), 'start');
	});
	$('#t_finish').click(function(){
		postActionToSrv(getSegment(window.location.href, 2), 'finish');
	});
	$('#t_unfinish').click(function(){
		postActionToSrv(getSegment(window.location.href, 2), 'unfinish');
	});
	$('#t_accept').click(function(){
		postActionToSrv(getSegment(window.location.href, 2), 'accept');
	});
	$('#t_reject').click(function(){
		postActionToSrv(getSegment(window.location.href, 2), 'reject');
	});
	$('#t_restart').click(function(){
		postActionToSrv(getSegment(window.location.href, 2), 'restart');
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
			success:function(){
				
			}
		});
	});
		function  _data(){
			$('.dimmer').addClass('active');
			$.ajax({
				type: 'GET',
				async: true,
				dataType: 'json',
				url: '/api/task/'+getSegment(window.location.href, 2),
				success: function(res){
					current_user = res.current_user;
					showTaskOnFeed(res);
					var button_selector = modifyCssByData(res);
					var assignees_selector = getAssigneesSelector(res);
					$(button_selector).addClass('active');
					$(assignees_selector).addClass('active');
					showUserInDropdown(res);
					$('.dimmer').removeClass('active');
				}
			});
		}


function showTaskOnFeed(data){
		if (data.error){
			if (data.error == "not_logged_in"){
				window.location.reload(true);
			}
			else {
				alert(data.error);
			}			
			return;
		}
		if (data.task.status == 'started'){
			$('.ui.yellow.label').addClass('purple').removeClass('yellow');
		}
		else if (data.task.status == 'finished'){
			$('.ui.yellow.label').addClass('grey').removeClass('yellow');
		}
		else if (data.task.status == 'rejected'){
			$('.ui.yellow.label').addClass('red').removeClass('yellow');
		}
		else if (data.task.status == 'accepted'){
			$('.ui.yellow.label').addClass('green').removeClass('yellow');
		}
	// one time values
		$('#task_title').text('Title:'+' '+' '+data.task.title || "Unknown");
		$('#task_id').text('Ticket ID: #'+data.task._id || "Unknown");
		$('#task_status').text(data.task.status || "Unknown");
		$('#task_creator').text(data.task.creator.first_name + " " + data.task.creator.last_name);
		$('#com_num').text(data.task.comments.length +" "+ 'Comments');

	// repeat for each comment and render as one HTML
		render_comments(data.task);	
	}
	$('#update_assignees').click(function(){
		//two arrays, server assignees represent the current assignees on db, while the updated_assignees
		//
		var $updated_assignees = [];
		var server_assignees = [];
		$('a.visible').each(function(){
			id_extraction = $(this).attr('data-value');
			console.log(id_extraction);
			$updated_assignees.push(id_extraction);
		});
		$.get('/api/task/'+getSegment(window.location.href, 2), function(res){
			for (var i=0; i<res.task.assignees.length; i++){
				server_assignees.push(res.task.assignees[i]._id.toString());
			}

			if (server_assignees.toString() == $updated_assignees.toString()){
				console.log('no changes made');
				return;
			}
			else {
				$.post('/api/task/'+getSegment(window.location.href, 2)+'/updateAssignees', {new_assignees: $updated_assignees}, function(res){
					
				});
			}

		});
	});


	load_task_data();


});

	




	




	