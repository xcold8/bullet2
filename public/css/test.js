$(document).ready(function(){
	var assignedIdx = 0;
	var createdByMeIdx = 0;
	var profileidx = 0;
//Load dashboard

	$.getJSON('/api/getDash', function (res){
		$('#open').text(res.dashboard.open+' New');
		$('#accepted').text(res.dashboard.accepted+' Accepted');
		$('#rejected').text(res.dashboard.rejected+' Rejected');
		$('#ongoing').text(res.dashboard.ongoing+' Ongoing');
	});

//Logout function
	$('#logOut').click(function(){
		window.location.replace('/acc/logout');
	});

//Load tasks list
	function loadTaskList(tab_name){
		if (tab_name === 'first' && assignedIdx === 0){
			$.ajax({
					type:'GET',
					async: false,
					dataType: 'json',
					url: '/api/getAssignedData',
					success: function(res){
						
						showData('first', res);
					},
			});
		}
		else if (tab_name === 'second' && createdByMeIdx === 0) {
			$.ajax({
					type:'GET',
					async: false,
					dataType: 'json',
					url: '/api/getCreatedData',
					success: function(res){
						showData('second', res);
					},
			});
		}
		else if(tab_name === 'profile'){
			return;
		}
	}

//Removes active class and empty the #data_cont div
//TODO: Ajax request and render by the class of the element
	$('a.item').click(function(){		
		var $menu_id = $(this).attr('data_tab');
		$('.item').removeClass('active');
		if ($menu_id === 'first'){
			$('.data_cont[data_tab=first]').show();
			$('.data_cont[data_tab=second]').hide();
			$('.data_cont[data_tab=profile]').hide();
		}
		else if ($menu_id ==='second'){
			$('.data_cont[data_tab=second]').show();
			$('.data_cont[data_tab=first]').hide();
			$('.data_cont[data_tab=profile]').hide();			
		}
		else if ($menu_id ==='profile'){
			$('.data_cont[data_tab=profile]').show();
			$('.data_cont[data_tab=first]').hide();
			$('.data_cont[data_tab=second]').hide();			
		}
		$(this).addClass('active');
		loadTaskList($menu_id);

	});
	function showData(tab_name, data) {
		if (data.error) {
			if (data.error == "not_logged_in") {
				window.location.reload(true);
			}
			else alert(data.error);
			return;
		}
		var template = $('#hbdemo').html();
		var templateScript = Handlebars.compile(template, {noEscape: true});
		for (var i=0; i<data.task.length; i++) {
			var task = data.task[i];
			if (task.status == "started") {
				task.icon_class = "purple half hourglass";
			}
			else if (task.status == "finished") {
				task.icon_class = "grey end hourglass";
			}
			else if (task.status =='rejected'){
				task.icon_class = "red end hourglass";
			}
			else if (task.status == 'accepted'){
				task.icon_class = 'green end hourglass';
			}
			else if (task.status == "new"){
				task.icon_class = 'yellow empty hourglass';
			}
		}
		var html = templateScript(data);

		var selector = '.data_cont[data_tab="'+tab_name+'"]';
		if (tab_name == 'first') {
			assignedIdx++;
		}
		else if (tab_name == 'profile'){
			profileIdx++;
		}
		else if (tab_name == 'second'){
			createdByMeIdx++;
		}
	  	$(selector).append(html);
	  	$('.page.dimmer').removeClass('active');
	}

//Toggle checkbox

	$('.allsel').click(function(){
		$('.ui.checkbox').not(this).checkbox('toggle');
	});
//simulate first click for ajax data to load
	$('.item[data_tab="first"]').click();
});