var curr_chat_room;
var width = $(window).width();
var size = width - 340;
var pos;
var isopenchat = 0;

$( window ).resize(function() {
	width = $(window).width();
	size = width - 340;
	pos = $("#sideChat").position();
	if (isopenchat) {
		if (width > 420)
		{
			$("#sideChat").css("left",size);
			$("#sideChat").css("width",340);
		}
		else
		{
			$("#sideChat").css("width","100%");
			$("#sideChat").css("left",0);
		}
	}
	else {
		$("#sideChat").css("left","100%");
	}
});
function openNav() {
	isopenchat = 1;
	if (width > 420)
	{
		$("#sideChat").css("width",340);
		$("#sideChat").css("left",size);
		$("#searchBar").fadeOut(500);
		$(".index_list").css("margin-top", 0);
		$(".search_ico").animate({ "left": "18px" }, "slow");
		


	}
	else
	{
		$("#sideChat").css("left",0);
		$(".search_ico").animate({ "left": "18px" }, "slow");
		$('.search_ico').css("display","none");
		$('#searchBar').css("display","none");
	}
	load_socket();
	var username = curr_user;
	curr_chat_room = undefined;
	
	$.ajax({
		url: '/chat',
		method: 'POST',
		data: { username: username }
	}).done(function(res) {
		if (res && res != "FAIL") {
			res.forEach(function(lists) {
				lists.forEach(function(list) {
					var recent_chat;
					if (!list.recent_chat && !list.recent_chat_time) {
						recent_chat = `Successfully connected to ${list.username}`;
					} else {
						recent_chat = $.trim(list.recent_chat);
					}
					var recent_chat_time = $.trim(list.recent_chat_time);
					var profile_pic = list.profile_pic.replace('public/', '/');
					$('#sideChat').append(`
						<div id="refresher_${list.id}">
							<div class="chat_list red" id="chat_preview_${list.id}" onclick="openChat(${list.id}, '${list.username}')">
								<div class="chat_profile"
									style="background-image: url('${profile_pic}')">
									<div class="chat_username">
										<h5>${list.username}<span class="chat_date">${recent_chat_time}</span></h5>
									</div>
									<div class="recent_chat">
										<span>${recent_chat}</span>
									</div>
								</div>
							</div>
						</div>
					`)
				});
			});    
		}
	});
}

/* Set the width of the sidebar to 0 and the left margin of the page content to 0 */
function closeNav() {
	isopenchat = 0;
   $("#sideChat").css("left", "100%");
	$('#sideChat').html(`
		<div class="close_btn">
			<a href="javascript:void(0)" onclick="closeNav()">
				<div class="x_btn"><i class="fas fa-times"></i></div>
			</a>
		</div>
	`);
	curr_chat_room = undefined;
	$('.search_ico').css("display","block");
	$(".search_ico").css('box-shadow', '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)');

}

function closeChat() {
	var username = curr_user;
	var connect_to = curr_chat_room;
	$.ajax({
		url: '/chat/chat_recent',
		method: 'POST',
		data: { username: username,
				connect_to: connect_to }
	}).done(function(res) {
		if (res && res != "FAIL") {
			list = res[0];
			var recent_chat;
			if (!list.recent_chat && !list.recent_chat_time) {
				recent_chat = `Successfully connected to ${list.username}`;
			} else {
				recent_chat = $.trim(list.recent_chat);
			}
			var recent_chat_time = $.trim(list.recent_chat_time);
			var profile_pic = list.profile_pic.replace('public/', '/');
			$(`#refresher_${connect_to}`).html(`
				<div class="chat_list red" id="chat_preview_${connect_to}" onclick="openChat(${connect_to}, '${list.username}')">
					<div class="chat_profile"
						style="background-image: url('${profile_pic}')">
						<div class="chat_username">
							<h5>${list.username}<span class="chat_date">${recent_chat_time}</span></h5>
						</div>
						<div class="recent_chat">
							<span>${recent_chat}</span>
						</div>
					</div>
				</div>
			`);
		}
	});
	curr_chat_room = undefined;
}

function openChat(connect_id, connect_name) {
	var username = curr_user;
	var connect_to = connect_id;
	var connect_name = connect_name;
	if (curr_chat_room) {
		$(`.chat_room`).css({"visibility":"hidden"});
		closeChat();
	}
	curr_chat_room = connect_id;
	$.ajax({
		url: '/chat/chat_load',
		method: 'POST',
		data: { username: username,
				connect_to: connect_to }
	}).done(function(res) {
		if (res && res != "FAIL") {
			load_socket();
			var profile_pic = res[0].profile_pic.replace('public/', '/');
			$(`#refresher_${connect_to}`).html(`
				<div class="chat_list orange" onclick="closeChat()">
					<div class="chat_profile"
						style="background-image: url('${profile_pic}')">
						<div class="chat_username">
							<h5>${connect_name}</h5>
						</div>
					</div>
				</div>
				<div class="chat_list chat_room orange">
					<div class="mesgs">
						<div class="msg_history" id='msg_box'></div>
						
						<div class="type_msg">
							<div class="input_msg_write">
								<textarea class="write_msg" placeholder="Type a message" id="m"></textarea>
								<input type='hidden' id="msg_connect_to" value=${connect_name}>
								<button class="msg_send_btn" id="send_msg" value=${connect_to}><i class="fas fa-paper-plane"></i></button>
							</div>
						</div>
					</div>
				</div>
			`);
			res.forEach(function(chat) {
				if (chat.from_user) {
					if (chat.from_user == username) {
						$('#msg_box').append(`
							<div class="outgoing_msg">
								<div class="sent_msg">
									<p><strong>${chat.from_user} : </strong>
										${chat.chat}</p>
									<span class="time_date"> ${chat.time}</span>
								</div>
							</div>
						`);
					} else {
						if (chat.from_user) {
							var profile_pic = chat.profile_pic.replace('public/', '/');
							$('#msg_box').append(`
								<div class="incoming_msg">
									<div class="incoming_msg_img" style="background-image: url('${profile_pic}')"></div>
									<div class="received_msg">
										<div class="received_withd_msg">
											<p><strong>${chat.from_user} : </strong>
												${chat.chat}</p>
											<span class="time_date"> ${chat.time}</span>
										</div>
									</div>
								</div>
							`);
						}
					}
				}
				updateScroll();
			});
		}
		updateScroll();
	})
}

function updateScroll(){
	if ($("#msg_box") && $("#msg_box")[0]) {
		$("#msg_box").scrollTop($("#msg_box")[0].scrollHeight);
	}   
}