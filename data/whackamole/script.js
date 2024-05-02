
const gameContainer = document.querySelector('.container');
const allMoleItems = document.querySelectorAll('.item');
let startGame;
let startTime;
let countDown = 0;
let score = 0;

const timeCount = document.getElementById('time-count');
const scoreCount = document.getElementById('score-count');
const startPrompt = document.getElementById('startprompt');

gameContainer.addEventListener('click', function(e){
    if(e.target.classList.contains('mole-clicked')){
        score++;
        scoreCount.innerHTML = score;

        const bushElem = e.target.parentElement.previousElementSibling;
        const moleItem = e.target.parentElement;

        let textEl = document.createElement('span');
        textEl.setAttribute('class', 'whack-text');
        textEl.innerHTML = "whack!";
        bushElem.appendChild(textEl);

        moleItem.classList.remove('mole-appear');

        setTimeout(() => {
            textEl.remove();
        }, 300);
    }

    if(countDown === 0) {
        startPrompt.style.display = "none";
        resetGames();
    }
})

// document.addEventListener('DOMContentLoaded', () => {
//     resetGames();
// });

// shows mole
function showMole(){
    if(countDown <= 0){
        clearInterval(startGame);
        clearInterval(startTime);
        timeCount.innerHTML = "0";
        startPrompt.style.display = "";

        for (mole of allMoleItems) {
            mole.classList.remove('mole-appear');
        }
    }
    let moleToAppear = allMoleItems[getRandomValue(0, allMoleItems.length)].querySelector('.mole');
    moleToAppear.classList.add('mole-appear');
    hideMole(moleToAppear);

}

function getRandomValue(min, max){
    let rand = Math.random() * (max - min) + min;
    return Math.floor(rand);
}

// hide Mole
function hideMole(moleItem){
    setTimeout(() => {
        moleItem.classList.remove('mole-appear');
    }, 2000);
}

function resetGames(){
    score = 0;
    startGame, startTime, countDown = 20;

    timeCount.innerHTML = countDown;
    scoreCount.innerHTML = score;
    countDown--;

    // total game time is 20 seconds
    startTime = setInterval(() => {
        timeCount.innerHTML = countDown;
        countDown--;
    }, 1000);

    startGame = setInterval(() => {
        showMole();
    }, 1000);
}
