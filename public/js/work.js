console.log('Hello World')
// sentence js
document.getElementById('ans').setAttribute('disabled', 'disabled');
setInterval(()=>{
    document.getElementById('sent').innerHTML=""
    document.getElementById('ans').removeAttribute('disabled');
},10000);