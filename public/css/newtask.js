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
		var $body = tinyMCE.activeEditor.getContent({});
		var $status = 'new';
		var $tasktype = 'chore';
		var $assignees = [];
		$('a.visible').each(function(index){
			var id_extraction = $(this).attr("data-value");
			
  			 $assignees.push(id_extraction);
		});
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
			async:true,
			data: newTaskFromClient,
			dataType:'json',
			url:'/api/newTask',
			success: function(storyid){
				window.location="/task/"+storyid;
			}
		});
		$("div.newTask").each(function() {
    		$(this).closest('div').find("input[type=text], textarea").val("");
		});
		$('.dropdown').dropdown('restore defaults');
		tinyMCE.activeEditor.setContent('');
	});
	$('select.dropdown').click(function(){
		$.ajax({
	  	 type:'GET',
	  	 async: true,
	 	 dataType: 'json',
	     url: '/api/getUsers',
	     success: addUserToDropdown,
		});
	});
});	

