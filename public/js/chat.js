const socket = io()

// Elements
const msgForm = document.querySelector('#message-form')
const msgFormButton = document.querySelector('button')
const msgFormInput = document.querySelector('input')
const currLocation = document.querySelector('#send-location')
const messages= document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    //new message element
    const newMessage = messages.lastElementChild

    //height of the new message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageheight = newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = messages.offsetHeight

    //height of messages container
    const containerHeight = messages.scrollHeight

    //how far scrolled
    const scrollOffSet = messages.scrollTop + visibleHeight

    if(containerHeight - newMessageheight <= scrollOffSet){
        messages.scrollTop = messages.scrollHeight
    }
}

socket.on('locationMessage', (url) => {
    console.log(url)
    const html = Mustache.render(locationTemplate,{
        username: url.username,
        url: url.text,
        createdAt: moment(url.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)

    autoscroll()
})

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)

    autoscroll()
})

socket.on('roomData', ({ room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

msgForm.addEventListener('submit' , (e) => {
    e.preventDefault()

    msgFormButton.setAttribute('disabled', 'disabled')
    const chat = msgFormInput.value
    socket.emit('DisplayChat', chat, () => {
        msgFormButton.removeAttribute('disabled')
        msgFormInput.value=''
        msgFormInput.focus()
        console.log('Message sent!')
    })
})

currLocation.addEventListener('click' ,(e) => {
    e.preventDefault()

    currLocation.setAttribute('disabled', 'disabled')
    if(!navigator.geolocation){
        return alert('Geolocation is not suppported by your browser!')
    }   

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            currLocation.removeAttribute('disabled')
            console.log('Location sent!')
        })
    })
})

socket.emit('join', {username, room} , (error) => {
    alert(error)
    location.href = '/'
})


