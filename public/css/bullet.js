$(document).ready(function(){
	$.getJSON('/api/getDash', function (res){
		$('#open').text(res.dashboard.open+' New');
		$('#accepted').text(res.dashboard.accepted+' Accepted');
		$('#rejected').text(res.dashboard.rejected+' Rejected');
		$('#ongoing').text(res.dashboard.ongoing+' Ongoing');
	});

	function toggle(source) {
  		checkboxes = document.getElementsByName('example');
  		for(var i=0, n=checkboxes.length;i<n;i++) {
    		checkboxes[i].checked = source.checked;
  		}
  	}
var assignedIdx = 0;
var createdByMeIdx = 0;
$('.container .item').tab({
	onLoad:function(tab_name){
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
	}
});

	$('#logOut').click(function(){
		window.location.replace('/acc/logout');
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
		console.log('templating...');
		for (var i=0; i<data.task.length; i++) {
			var task = data.task[i];
			if (task.status == "started") {
				task.icon_class = "user";
			}
			else if (task.status == "finished") {
				task.icon_class = "user outline";
			}
		}
		var html = templateScript(data);

		var selector = 'div.tab.segment[data-tab="' + tab_name + '"] .list_cont';
		if (tab_name == 'first') {
			assignedIdx++;
		}
		else {
			createdByMeIdx++;
		}
	  	$(selector).append(html);
	  	$('.page.dimmer').removeClass('active');
	  	assignedIdx++;

	}
	// simulate click on first tab
	$('.item[data-tab="first"]').click();
	// checkbox selectors
	$('.allsel').click(function(){
		$('.ui.checkbox').checkbox('check');
	});

});
