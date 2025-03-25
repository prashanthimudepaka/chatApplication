const socket = io('http://localhost:5000/', {
    autoConnect: false
})
//Global variables
const ChatBody = document.querySelector('.chat-body')
const userTitle = document.getElementById('user-title')
const loginContainer = document.querySelector(".login-container")
let userTable = document.querySelector('.users')
const userTagLine = document.querySelector('#users-tagline')
const title = document.querySelector('#active-user')
const messages = document.querySelector('.messages')
const msgDiv = document.querySelector('.msg-form')



//Global methods
const methods = {
    socketConnect: async (username, userID) => {
        socket.auth = {
            username,
            userID

        }
        await socket.connect()
    },
    createSession: async (username) => {
        const data = {
            username
        }
        let options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)

        }
        await fetch('/session', options)
            .then(res => res.json())
            .then(data => {
                // console.log(data)
                methods.socketConnect(data.username, data.userID)
                socket.connect()

                //set localstorage for sesion
                localStorage.setItem('session-username', data.username)
                localStorage.setItem('session-userID', data.userID)

                loginContainer.classList.add('d-none')
                ChatBody.classList.remove('d-none')
                userTitle.innerHTML = data.username
            })
            .catch(err => console.log(err))

    },
    setActiveUser: (username, userID) => {
        // console.log(username,userID)
        title.innerHTML = username;
        msgDiv.classList.remove('d-none')
        title.setAttribute('userID', userID)
        //user list active and inactive class event handler
        const list = document.getElementsByClassName('socket-users')
        // console.log(list)
        for (let i = 0; i < list.length; i++) {
            list[i].classList.remove('table-active')
        }
        event.currentTarget.classList.add('table-active')
        //display message area after selecting user
        msgDiv.classList.remove('d-none')
        messages.innerHTML = ''//to show every user chat to that specific user only
        socket.emit('fetch-messages', { receiver: userID })

    },
    appendMessage: ({ message, time, background, position }) => {
        let div = document.createElement('div')
        div.classList.add('message', 'bg-opacity-25', 'rounded', 'm-2',
            'px-2', 'py-1', background, position)
        div.innerHTML = `<span class="msg-text">${message}</span>
        <span class="msg-time">${time}</span>`
        messages.append(div)
        messages.scrollTo(0, messages.scrollHeight)

    }



}
const user= localStorage.getItem("user");
        const data = {};
        
       
// const user= localStorage.getItem("user");
//         const data = {};
        
//         if(user){
//             const _user= JSON.parse(user);
//             methods.createSession( _user.name.toLowerCase())
//         }else{
//             window.location.href = "/login";
//         }

//session variables  and get session username and userid
const sessUsername = localStorage.getItem('session-username')//key and value are displayed in localstorage
const sessUserID = localStorage.getItem('session-userID')
if (sessUsername && sessUserID) {
    methods.socketConnect(sessUsername, sessUserID)

    loginContainer.classList.add('d-none')
    ChatBody.classList.remove('d-none')
    userTitle.innerHTML = sessUsername
}else {
    if(user){
        const _user= JSON.parse(user);
        methods.createSession( _user.name.toLowerCase())
    }else{
        window.location.href = "/login";
    }
}
//login form handler
const loginForm = document.querySelector('.user-login')
loginForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const username = document.getElementById('username')
    methods.createSession(username.value.toLowerCase())
    username.value = ''
})


        

//users list table
socket.on('users', ({ users }) => {

    console.log(users)
    //removing self user
    const index = users.findIndex(user => user.userID == socket.id)
    if (index > -1) {
        users.splice(index, 1)

    }

    //console.log(users)
    //generating user table list
    userTable.innerHTML = '';
    let ul = '<table class="table table-hover" id="userListtable">'//table hover is booostrap class
    for (const user of users) {
        ul += `<tr data-id="${user.userID}" class="socket-users" onclick= "methods.setActiveUser('${user.username}','${user.userID}')">
        <td>${user.username}</td></tr>`
        // <span class="text-danger ps-1 d-none id="${user.userID}">!</span>
    }
    ul += '</table>'
    if (users.length > 0) {
        userTable.innerHTML = ul
        userTagLine.innerHTML = "online users"
        userTagLine.classList.add('text-success')
        userTagLine.classList.remove('text-danger')

    }
    else {
        userTagLine.innerHTML = 'no active user'
        userTagLine.classList.remove('text-success')
        userTagLine.classList.add('text-danger')
    }

})

//chat form handler 
const msgForm = document.querySelector('.msgForm')
const message = document.getElementById('input-message')
msgForm.addEventListener('submit', e => {
    e.preventDefault()//default submission we should prevent

    const to = title.getAttribute('userID')
    let time = new Date().toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true

    })
    //set new message payload
    let payload = {
        from: socket.id,
        to,
        message: message.value,
        time
    }
    //emit messge to server
    socket.emit('message-to-server', payload)
    methods.appendMessage({ ...payload, background: 'bg-success', position: 'right' })
    message.value = ''
    message.focus()
})
//recieve private message
socket.on('message-to-user', (payload) => {
    const {to, message, time, from } = payload;
    console.log(payload)
    const activeTab= document.querySelector("#active-user").getAttribute("userid");
    if(activeTab!==from || !activeTab){
    const tableTrs= document.querySelector("#userListtable").getElementsByTagName("tr");
    for (let index = 0; index < tableTrs.length; index++) {
        const element = tableTrs[index];
        console.log(element.innerText)
        const Id= element.getAttribute("data-id")
        if(Id===from){
            let count= 1;
            if(element.cells[0]){
                if(element.cells[0].querySelector("span"))
                {
                    count=element.cells[0].querySelector("span").textContent?parseInt(element.cells[0].querySelector("span").textContent)+1:count;
                    element.cells[0].querySelector("span").textContent=count;
                }else{
                    var dateSpan = document.createElement('span');
                    dateSpan.className="notification";
                    dateSpan.innerText = count;
                    element.cells[0].appendChild(dateSpan);
                }               
            }
            
        }
    }
    }else{
        methods.appendMessage({message,time, background:'bg-secondary',position:'left'})
    }
    

//    const receiver = title.getAttribute('userID')
//    const notify = document.getElementById(from)
//    if(receiver==null)
//    {
//     notify.classList.remove('d-none')
//    }
//    else if(receiver==from){
//     methods.appendMessage({
//         message,
//         time,
//         background:'bg-secondary',
//         position:'left'
//     })
    // }
// else{
//     notify.classList.remove('d-none')
//    }
})

//get stored messages from mongodb

socket.on('stored-messages', ({ messages }) => {
    if (messages.length > 0) {
        messages.forEach(msg => {
            let payload = {
                message: msg.message,
                time: msg.time
            }
            if (msg.from == socket.id) {
                methods.appendMessage({
                    ...payload,
                    background: 'bg-success',
                    position: 'right'
                })

            }
            else {
                methods.appendMessage({
                    ...payload,
                    background: 'bg-secondary',
                    position: 'left'
                })
            }

        });
    }
})

document.addEventListener('DOMContentLoaded', () => {
    const socket = io(); // Connect to the socket.io server

    // Get the username from the session (you can also pass it from the server)
    const username = sessionStorage.getItem('username'); // Assuming you store it in sessionStorage

    if (username) {
        // Display the username in the chat UI
        document.getElementById('user-title').innerText = username;
    } else {
        // Redirect to login if no username is found
        window.location.href = '/login';
    }

    // Handle sending messages, etc.
    const msgForm = document.querySelector('.msgForm');
    msgForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const messageInput = document.getElementById('input-message');
        const message = messageInput.value;
        socket.emit('message-to-server', { from: username, message });
        messageInput.value = ''; // Clear the input
    });

    // Handle receiving messages
    socket.on('message-to-user', (payload) => {
        // Display the message in the chat UI
    });
});