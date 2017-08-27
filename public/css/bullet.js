$(document).ready(function(){

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
		var html = templateScript(data);

		var selector = 'div.tab.segment[data-tab="' + tab_name + '"]';
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
	$('.allsel').click(function(){
		$('.ui.checkbox').checkbox('check');
	});

});
