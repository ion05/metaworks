document.querySelector('.line-div').addEventListener('click',()=>{
    document.querySelector('.user-blob').style.display = 'block'
    document.querySelector('.line-div-1').style.display = 'block'
    document.querySelector('.line-div').style.display = 'none'
})
document.querySelector('.line-div-1').addEventListener('click',()=>{
    document.querySelector('.user-blob').style.display = 'none'
    document.querySelector('.line-div-1').style.display = 'none'
    document.querySelector('.line-div').style.display = 'block'
})

document.querySelector('.suit').addEventListener('click',()=>{
    location.href='/dashboard/work'
})
document.querySelector('.rest').addEventListener('click',()=>{
    location.href='/dashboard/rest'
})
document.querySelector('.complain').addEventListener('click',()=>{
    document.querySelector('.modal').style.display = 'block'
    document.querySelector('.modal-div').style.display = 'block'
    document.querySelector('.modal-div').style.animation = 'modal-animation 1s ease'
})
document.querySelector('.repo').addEventListener('click',()=>{
    document.querySelector('.modal-1').style.display = 'block'
    document.querySelector('.modal-div').style.display = 'block'
    document.querySelector('.modal-div').style.animation = 'modal-animation 1s ease'

})
document.querySelector('.close').addEventListener('click',()=>{
    document.querySelector('.modal').style.display = 'none'
    document.querySelector('.modal-div').style.display = 'none'
})
document.querySelector('.close-1').addEventListener('click',()=>{
    document.querySelector('.modal-1').style.display = 'none'
    document.querySelector('.modal-div').style.display = 'none'

})

