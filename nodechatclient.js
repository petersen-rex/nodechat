var ajaxErrors = 0;

function poll(data){
	if(data && data.msg){
		addMsg(data.msg);
	}
	
	$.ajax({ cache: false
         , type: "GET"
         , url: "/recv"
         , dataType: "json"
         , error: function () {
             ajaxErrors += 1;
             setTimeout(poll, 10000);
           }
         , success: function (data) {
             ajaxErrors = 0;
             poll(data);
           }
         });
}

function sendMsg(id, msg){
	$.ajax({ cache: false
        , type: "GET"
        , url: "/send"
        , dataType: "json"
        , data: { 'id': id, 'msg' : msg }
        });
}

function addMsg(msg){
	$('#chatout').append(msg + '<br>');
	$("#chatout").attr({ scrollTop: $("#chatout").attr("scrollHeight") });
}

$(function(){
	$('#chatMsg').keyup(function(event){
	  if(event.keyCode == 13){
		  sendMsg($('#chatId').val(), $('#chatMsg').val());
		  $('#chatMsg').val('');
	  }
	});
});

poll();
