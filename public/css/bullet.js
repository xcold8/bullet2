$(document).ready(function(){
	function addUserToDropdown(data){
		var wrapper = {objects: data};
		var tmplate = $('#assigndropdown').html();
		var tmplateScript = Handlebars.compile(tmplate);
		var html = tmplateScript(wrapper);
		$('select.dropdown').append(html);
		$('select.dropdown').dropdown();

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
	  						success: showAssignedData,
						});
					}
					else if (tab_name === 'second' && createdByMeIdx === 0) {
						$.ajax({
	  						type:'GET',
	  						async: false,
	  						dataType: 'json',
	  						url: '/api/getCreatedData',
	  						success: showCreatedData,
						});

					}
				}
			});

	$('#logOut').click(function(){
		window.location.replace('/acc/logout');
	});
	$('select.dropdown').click(function(){
		$.ajax({
	  	 type:'GET',
	  	 async: false,
	 	 dataType: 'json',
	     url: '/api/getUsers',
	     success: addUserToDropdown,
		});
	});

	// Within the callback, use .tmpl() to render the data.
	function showAssignedData(data){
		var template = $('#hbdemo').html();
		var templateScript = Handlebars.compile(template);
		console.log('templating...');
		var htmll = templateScript(data);
	  	$('div.tab.segment[data-tab="first"]').append(htmll);
	  	assignedIdx++;

	}
		function showCreatedData(data){
		var template = $('#hbdemo').html();
		var templateScript = Handlebars.compile(template);
		console.log('templating...');
		var htmll = templateScript(data);
	  	$('div.tab.segment[data-tab="second"]').append(htmll);
	  	createdByMeIdx++;

	}


	$('#sTask').click(function(){
		var $title = $('input.title').val();
		var $body = $('textarea').val();
		var $status = 'new';
		var $tasktype = 'chore';
		var $assignees = [];
		$('a.visible').each(function(index){
			var id_extraction = $(this).attr("data-value");
			
  			 $assignees.push(id_extraction);
		});
		console.log($assignees);
		var newAssigneesArr = $assignees.filter(function(v){return v!==''});
		var newTaskFromClient = {
			title: $title,
			body: $body,
			status: $status,
			tasktype: $tasktype,
			assignees: newAssigneesArr
		};
		$.ajax({
			type:'POST',
			async:false,
			data: newTaskFromClient,
			dataType:'json',
			url:'/api/newTask'
		});
		$("div.newTask").each(function() {
    		$(this).closest('div').find("input[type=text], textarea").val("");
		});
		$('.dropdown').dropdown('restore defaults');
	});		
});
