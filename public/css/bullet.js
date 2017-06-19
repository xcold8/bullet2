$(document).ready(function(){
	$('#logOut').click(function(){
		window.location.replace('/acc/logout');
	});

	// Within the callback, use .tmpl() to render the data.
	function showData(data){
		console.log(data);
		var template = $('#hbdemo').html();
		var templateScript = Handlebars.compile(template);
		console.log('templating...');
		var htmll = templateScript(data);
	  	$('.tasklist').append(htmll);
}


	$.ajax({
	  type:'GET',
	  async: false,
	  dataType: 'json',
	  url: '/api/getData',
	  success: showData,
	});
		


});