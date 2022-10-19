import { handleChatNotifications, returnTime } from "../utilities.js";

const chatContainer = document.querySelector('.chat-container');

const showChatMessage = (msg, className, nickname, serverTime) => {
    
    const message = document.createElement('div')
    message.className = 'message-chat';
    message.innerHTML = `<strong>${nickname}</strong>: ${msg}`;
    const time = document.createElement('div');
    time.className = 'time';
    
    time.append(serverTime || returnTime());
    message.appendChild(time);
    const messageNode = document.createElement('div');
    messageNode.className = 'messages ' + className
    messageNode.appendChild(message);
    chatContainer.appendChild(messageNode)
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

export const sendMessage = (socket) => {
    const msgBody = document.querySelector('.msg-input');
    
    socket.emit('message-chat', ({
        type: CLIENT.MESSAGE.NEW_MESSAGE,
        payload: msgBody.value
    }))
    showChatMessage(msgBody.value, '', 'You');
    msgBody.value = '';
}

export const receiveMessage = (payload) => {    
    
    handleChatNotifications(true);
    
    const {nickname, body, time} = payload;
    showChatMessage(body, 'received', nickname, time)
}