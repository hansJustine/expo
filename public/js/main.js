var radioHearts = document.querySelectorAll('.voteCardTitle');
var loadingBtns = document.querySelectorAll('.loadingBtns');

function success() {
  if(document.getElementById("username").value.length > 0 && document.getElementById("password").value.length > 0) { 
      document.getElementById('loginBtn').disabled = false; 
  } else { 
      document.getElementById('loginBtn').disabled = true;
  }
}
function ifOthers(val){
  var othersInput = document.getElementById('othersInput');
  var specify = document.getElementById('specify');
  if(val == 'others'){
      othersInput.style.display='block';
      specify.style.display='block';
      othersInput.value = null;
  }else if(val != 'others'){  
      othersInput.style.display='none';
      specify.style.display='none';
      othersInput.value = val;
  }
}
//Exit Flash Message
$('.exitFlash').click(() => {
    $('.flashMsg').css({"display": "none"});
    $('.moveForm').css({"margin": "50px auto"})
});

//Register Modal
$('.regJudge').click(() => {
    $('.ui.modal').modal();
});

$('#hybrid')
  .dropdown({
    on: 'hover'
});
// Modal
$('.regQrBtn').click(()=>{
  $('#regQrModal')
.modal('show');
});
$('.registerJudgeBtn').click(()=>{
    $('#registerJudgeModal')
  .modal('show');
});
$('.registerRegistrarBtn').click(()=>{
  $('#registerRegistrarModal')
.modal('show');
});
$('.registerBoothBtn').click(()=>{
    $('#registerBoothModal')
  .modal('show');
});
$('.registerQrBtn').click(()=>{
    $('#registerQrModal')
  .modal('show');
});
$('.regCanBtn').click(()=>{
    $('.ui.modal')
  .modal('hide');
});
$('.addBtn').click(()=>{
    $('#addModal')
  .modal('show');
});
$('.addCriteriaBtn').click(()=>{
  $('#addCriteriaModal')
.modal('show');
});
$('.deleteBtn').click(()=>{
    $('#deleteModal')
  .modal('show');
});

//Set Loading on button
function removeLoadingBtns(){
    loadingBtns.forEach((loadingBtn) => {
        loadingBtn.classList.remove('loading')
    })
}
loadingBtns.forEach((elm) => {
    elm.addEventListener('click', () => {
        removeLoadingBtns();
        elm.classList.add('loading');
    });
});