// 鍙戦€佹寜閽�
document.getElementById('send-btn').addEventListener('click', function () {

	token = localStorage.getItem('token')
	if (token == undefined) {
		alert('鎶辨瓑鍝︼紝鎮ㄨ繕娌℃湁娉ㄥ唽')
		return
	}

	var input = $('#question-input').val()
	input = input.replace(/^\s*|\s*$/g,"");
	if (input != '') {

		let tempId = "chat-item-temp-" + Math.round(Math.random()*10000)

		// 灏嗙敤鎴疯緭鍏ュ唴瀹圭珛鍗虫坊鍔犱笂鍘�
		let historyChatList = JSON.parse(localStorage.getItem('historyChatList')) || []
		historyChatList.push({
			"type": "human",
			"text": input
		})

		localStorage.setItem('historyChatList', JSON.stringify(historyChatList))
		let chatItem = "<div class=\"chat-item-right\">" +
				"<div class=\"chat-bubble\">" +
				input +
				"</div>" +
				"<img src=\"me.png\" class=\"chat-avatar\" />" +
				"</div>"
			$('.chat-flow').append(chatItem)


		// 鍔犱竴涓鍦ㄥ洖澶嶄腑鐨勪复鏃禼hat
		let	chatItemTemp = "<div class=\"chat-item-left\" id=\"" + tempId + "\">" +
			"<img src=\"popup.png\" class=\"chat-avatar\" />" +
			"<div class=\"chat-bubble\">" +
			"路路路绋嶇瓑路路路" +
			"</div>" +
			"</div>"

		$('.chat-flow').append(chatItemTemp)
		$('.chat-flow').animate({scrollTop: $('.chat-flow').prop('scrollHeight')}, 500);
		$('#question-input').val('')


		function chatDone() {
			// 鏁版嵁鑾峰彇瀹屾垚锛屽皢鍏跺瓨鍌ㄨ捣鏉�

			let chatgptResponse = $(`#${tempId} .chat-bubble`).html()

			let historyChatList = JSON.parse(localStorage.getItem('historyChatList')) || []
			historyChatList.push({
				"type": "chatgpt",
				"text": chatgptResponse
			})

			// 鍔犲叆鏈湴瀛樺偍
			localStorage.setItem('historyChatList', JSON.stringify(historyChatList))
			let	chatItem = "<div class=\"chat-item-left\">" +
				"<img src=\"popup.png\" class=\"chat-avatar\" />" +
				"<div class=\"chat-bubble\">" +
				chatgptResponse +
				"</div>" +
				"</div>"

			$(`#${tempId}`).remove()
			$('.chat-flow').append(chatItem)
			$(".chat-flow").scrollTop($('.chat-flow').prop('scrollHeight'));

			getUserInfo(token)
		}

		// 璇锋眰chatgpt

		chat_history = JSON.parse(localStorage.getItem('historyChatList')).slice(-5)
		myFetchEventSource(input, chat_history, token, callback=function(t) {

			if ('data' in t) {
				data = t.data

				if (data != '[DONE]') {
					data = JSON.parse(data);

					// 濡傛灉鍚庣杩斿洖鏈夐敊璇紝寮圭獥鎻愮ず
					if ('message' in data) {
						alert(data['message'])
						$(`#${tempId}`).remove()
						return
					}

					delta = data['choices'][0]['delta']
					if ('content' in delta) {
						//console.log(delta['content'])

						// 鎶婃湰娆¤幏鍙栫殑鍐呭鍜屼箣鍓嶇殑鎷兼帴鍦ㄤ竴璧�
						let oldValue = $(`#${tempId} .chat-bubble`).html()
						if (oldValue == '路路路绋嶇瓑路路路') {
							oldValue = ''
						}

						let newValue = oldValue + delta['content']
						newValue = newValue.replaceAll("\n", "<br/>")
						$(`#${tempId} .chat-bubble`).html(newValue)
						$(".chat-flow").scrollTop($('.chat-flow').prop('scrollHeight'));
					} else if (data['choices'][0]['finish_reason'] != null){
						chatDone()
					}
				} else if (data == '[DONE]') {
					chatDone()
				}
			}
		}, error_callback=function(err) {
			$(`#${tempId} .chat-bubble`).html('鍟婂摝锛岀綉缁滃嚭闂浜嗭紝绛変細鍎挎潵璇曡瘯')
		})
	}
});


// 娓呴櫎鎸夐挳
document.getElementById('clear-btn').addEventListener('click', function () {
	$('#question-input').val('')
});


// 娓呯┖鍘嗗彶璁板綍鎸夐挳
document.getElementById('clear-history').addEventListener('click', function () {
	var r = confirm("纭畾瑕佹竻绌哄巻鍙插璇濊褰曞悧锛�");
	if (r == true) {
	    $('.chat-item-left, .chat-item-right').remove()
	    localStorage.setItem('historyChatList', JSON.stringify([]))
		loadHistoryDialog()
	}
});


// 鍔犺浇鍘嗗彶瀵硅瘽
function loadHistoryDialog() {

	let historyChatList = JSON.parse(localStorage.getItem('historyChatList'))
	if (historyChatList) {

		// 鏍煎紡鍖栧唴瀹�
		for (let i = 0; i < historyChatList.length; i++) {

			let text = historyChatList[i]["text"]
			let type = historyChatList[i]["type"]

			let chatItem = ''
			if (type == 'chatgpt') {
				chatItem = "<div class=\"chat-item-left\">" +
				"<img src=\"popup.png\" class=\"chat-avatar\" />" +
				"<div class=\"chat-bubble\">" +
				text +
				"</div>" +
				"</div>"
			} else {
				chatItem = "<div class=\"chat-item-right\">" +
				"<div class=\"chat-bubble\">" +
				text +
				"</div>" +
				"<img src=\"me.png\" class=\"chat-avatar\" />" +
				"</div>"
			}

			$('.chat-flow').append(chatItem)
		}
		$('.chat-flow').animate({scrollTop: $('.chat-flow').prop('scrollHeight')}, 100);
	}
}


// 鑾峰彇鐢ㄦ埛淇℃伅
function getUserInfo(token) {
	// body...

	$.ajax({
        url: '/api/user_info',
        type: 'GET',
        beforeSend: function (request) {
            request.setRequestHeader("token", token);
        },
        success: function (data) {

        	if (!data.data.user_info.buy_user) {
        		$("#free-times-view").show()
        		$("#expire-view").hide()
        		$("#free-times").html(data.data.user_info.free_times - data.data.user_info.chat_count)
        	} else {
        		$("#free-times-view").hide()

        		let expire_time = new Date(Date.parse(data.data.user_info.expire_time))
        		let now_time = new Date()

        		if (now_time > expire_time) {
        			$("#expire-tip-1").html("鎮ㄧ殑浣跨敤鏉冮檺宸蹭簬")
        			$("#expire-view").show()
        			$("#expire-time").html(data.data.user_info.expire_time)
        		} else {
	        		let diff = expire_time - now_time;
	    			let days = parseInt(diff / (1000 * 60 * 60 * 24), 10);
	    			if (days <= 3) {
	    				$("#expire-tip-1").html("鎮ㄧ殑浣跨敤鏉冮檺灏嗕簬")
        				$("#expire-view").show()
        				$("#expire-time").html(data.data.user_info.expire_time)
	    			}
        		}

        	}
        },
        error: function (data) {
        	console.log("error");
     	}
    });
}



// 鐐瑰嚮娉ㄥ唽
function register(code) {

	// 璁块棶鍚庣娉ㄥ唽鎺ュ彛锛岃嫢鍚庣杩斿洖鎴愬姛锛屽垯灏唗oken鍐欏叆鏈湴瀛樺偍
	$.ajax({
        url: '/api/check_token_api',
        type: 'GET',
        beforeSend: function (request) {
            request.setRequestHeader("token", code);
        },
        success: function (data) {

        	if (data.status == 0) {
        		alert('娉ㄥ唽鎴愬姛锛�')
        		localStorage.setItem('token', code)
        		$("#register-view").hide()
				$("#chat-view").show()

				getUserInfo(code)
        	} else {
        		alert('娉ㄥ唽澶辫触锛�' + data.message)
        	}
        },
        error: function (data) {
        	alert('鍟婂摝锛屽嚭閿欎簡锛�')
     	}
    });
}


// 妫€鏌ユ敞鍐屾儏鍐�
function checkRegister() {

	$("#expire-view").hide()
	$("#free-times-view").hide()

	token = localStorage.getItem('token')
	if (token != null) {
		$("#register-view").hide()
		$("#chat-view").show()

		getUserInfo(token)

	} else {
		$("#register-view").show()
		$("#chat-view").hide()
	}
}



function init() {

	checkRegister()

	loadHistoryDialog()


	$("#register-btn").click(function (event) {
		let inputCode = $("#register-input").val()
		inputCode = inputCode.replace(/^\s*|\s*$/g,"");
		if (inputCode != '') {
			register(inputCode)
		} else {
			alert('璇疯緭鍏ユ纭殑閭€璇风爜锛�')
		}

	});


	// 鏂囨湰妗嗗洖杞﹀搷搴旓細鐐瑰嚮鍙戦€佹寜閽�
	$("#question-input").keydown(function (event) {
		if(event.keyCode == 13){
聽聽聽聽聽聽聽聽	$("#send-btn").click();
		}
聽聽聽聽});

	$("#fullscreen-btn").click(function (event) {

		window.open('newchat.html', '_blank');
	});
}


init()
