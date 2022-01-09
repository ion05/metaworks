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
