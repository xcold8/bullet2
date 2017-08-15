$(document).ready(function(){
		function addUserToDropdown(data){
		var wrapper = {objects: data};
		var tmplate = $('#assigndropdown').html();
		var tmplateScript = Handlebars.compile(tmplate);
		var html = tmplateScript(wrapper);
		$('select.dropdown').append(html);
		$('select.dropdown').dropdown();

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
	$('select.dropdown').click(function(){
		$.ajax({
	  	 type:'GET',
	  	 async: false,
	 	 dataType: 'json',
	     url: '/api/getUsers',
	     success: addUserToDropdown,
		});
	});
});
