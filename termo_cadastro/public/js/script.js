const board = document.getElementById('board');
let solution = '';
async function fetchWordOfTheDay() {
    try {
      const response = await fetch('http://localhost:3000/todays-word');
      if (!response.ok) throw new Error('Erro na requisição');
      const data = await response.json();
      return data; // Retorna "liege"
    } catch (error) {
      console.error('Erro:', error);
      return null;
    }
  }
  
  // Uso:
  fetchWordOfTheDay().then(row => {
    solution = row.word.toUpperCase();
    definitions = row.definitions


    createBoard();

  });

async function isWord(word){
    try {
        const response = await fetch(`http://localhost:3000/${word.toLowerCase()}/is-a-word`);
        if (!response.ok) throw new Error('Erro na requisição');
        const data = await response.json();
        return data.isWord; 
      } catch (error) {
        console.error('Erro:', error);
        return null;
      }
}
async function sendWordToServer(word, attempt){
  try {
    const token = localStorage.getItem("token");
    
    const req = await fetch("http://localhost:3000/play", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token, word, attempt })
    }); 
  } catch (error) {
    console.error('Erro:', error);
    return null;
  }
}
let definitions = []
let currentDef = 0;

let currentRow = 0;
let currentGuess = '';
let finished = false;

function createBoard() {
  let wordss ="";
  const tempStyles = []
  for(let i = 0; i < window.words.length; i++){
    wordss+=window.words[i]["guess"];
    currentRow++;
    let tempSolution = solution;

    for (let j = 0; j < 5; j++) {

      tempStyles[j+ (i*5)]="absent";
   }



   let correct = 0;
   for (let j = 0; j < 5; j++) {
     const letter = window.words[i]["guess"].charAt(j);
     if (letter === tempSolution[j]) {
       tempStyles[j + (i*5)]="correct";
       correct++;
       tempSolution = tempSolution.substring(0, j) + '0' + tempSolution.substring(j + 1);
     }
     if(correct>=5){
       finish();
     }
   }

   for (let j = 0; j < 5; j++) {
       const letter = window.words[i]["guess"].charAt(j);
       if (tempSolution.includes(letter) && !(tempStyles[j + (i*5)]=="correct") ) {

         tempStyles[j + (i*5)]="present";

         const index = tempSolution.indexOf(letter);
         tempSolution = tempSolution.substring(0, index) + '0' + tempSolution.substring(index + 1);
       }
    }

  }
    
  for (let i = 0; i < 30; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';

    if(wordss.charAt(i)!= ""){
    cell.innerHTML=wordss.charAt(i);
    


   
        setTimeout(()=>{
            const letter = wordss.charAt(i);
            cell.classList.add(tempStyles[i]);
            colorKey(letter, tempStyles[i])
        }, 300);
  }

    board.appendChild(cell);
    
  }
  if(currentRow> 5) {
    finish();
  }
}

function updateBoard() {
  const start = currentRow * 5;
  for (let i = 0; i < 5; i++) {
    const cell = board.children[start + i];
    cell.textContent = currentGuess[i] || '';
  }
}


function colorKey(letter, status) {
    const keyButtons = document.querySelectorAll('.key');
    keyButtons.forEach(btn => {
        
      if (btn.textContent.toUpperCase() === letter) {
        // Prioridade: correct > present > absent
        if (
          (status === 'correct') ||
          (status === 'present' && !btn.classList.contains('correct')) ||
          (status === 'absent' && !btn.classList.contains('correct') && !btn.classList.contains('present'))
        ) {

          btn.classList.remove('correct', 'present', 'absent');
          btn.classList.add(status);
        }
      }
    });
  }

  function checkGuess() {

    isWord(currentGuess).then(isWord=>{
        if(isWord){
            const start = currentRow * 5;
    let tempSolution = solution;
    const tempStyles = []
    for (let i = 0; i < 5; i++) {

       tempStyles[i]="absent";

      const cell = board.children[start + i];
    }



    let correct = 0;
    for (let i = 0; i < 5; i++) {
      const cell = board.children[start + i];
      const letter = currentGuess[i];
      if (letter === tempSolution[i]) {
        tempStyles[i]="correct";
        correct++;
        tempSolution = tempSolution.substring(0, i) + '0' + tempSolution.substring(i + 1);
      }
      if(correct>=5){
        finish();
      }
    }

    for (let i = 0; i < 5; i++) {
        const cell = board.children[start + i];
        const letter = currentGuess[i];
        if (tempSolution.includes(letter) && !(tempStyles[i]=="correct") ) {
          tempStyles[i]="present";
          const index = tempSolution.indexOf(letter);
          tempSolution = tempSolution.substring(0, index) + '0' + tempSolution.substring(index + 1);
        }
      }

    for (let i = 0; i < 5; i++) {
        setTimeout(()=>{
            const cell = board.children[start + i];
            const letter = currentGuess[i];
            cell.classList.add(tempStyles[i]);
            colorKey(letter, tempStyles[i])
        }, 300*i);
    }
    sendWordToServer(currentGuess, currentRow+1);
    setTimeout(()=>{
        currentRow++;
        if(currentRow> 5) {
            finish();
        }
        currentGuess = '';
    }, 300*5);
        
        }
    })
    


  }

document.addEventListener('keydown', (e) => {
    if(!finished){
  if (e.key === 'Enter' && currentGuess.length === 5) {
    checkGuess();
  } else if (e.key === 'Backspace') {
    currentGuess = currentGuess.slice(0, -1);
    updateBoard();
  } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < 5) {
    currentGuess += e.key.toUpperCase();
    updateBoard();
  }
}
});


const keyboard = document.getElementById('keyboard');
const keys = [
  'QWERTYUIOP',
  'ASDFGHJKL',
  '↩ZXCVBNM⌫'
];

function createKeyboard() {
  keys.forEach(row => {
    [...row].forEach(k => {
      const btn = document.createElement('button');
      btn.textContent = k === '↩' ? 'Enter' : k === '⌫' ? '←' : k;
      btn.className = 'key' + (k === '↩' || k === '⌫' ? ' special' : '');
      btn.addEventListener('click', () => handleKey(k));
      keyboard.appendChild(btn);
    });
    keyboard.appendChild(document.createElement('br'));
  });
}
let debounce = false;
function handleKey(k) {
    if(!finished){
      if(debounce) return;
  if (k === '↩' && currentGuess.length === 5) {
    checkGuess();
    debounce=true
    setInterval(()=>{debounce=false},3000)

  } else if (k === '⌫') {
    currentGuess = currentGuess.slice(0, -1);
    updateBoard();
  } else if (/^[a-zA-Z]$/.test(k) && currentGuess.length < 5) {
    currentGuess += k.toUpperCase();
    updateBoard();
  }
}
}

createKeyboard();


function finish(){
    const finishedDiv = document.getElementById("finished");
    finishedDiv.style.display="block";

    setTimeout(()=>{
        finished = true;
        finishedDiv.style.transition="0.3s";
        finishedDiv.style.opacity="1";
        const closeBtn = document.createElement("button");
        closeBtn.innerHTML="X";
        closeBtn.id = "closeFinishedMenu";
        closeBtn.addEventListener("click", ()=>{
            finishedDiv.style.opacity="0";
            setTimeout(()=>{
            finishedDiv.style.display="none";
        },200);
        });
        finishedDiv.appendChild(closeBtn);


        wordTag = document.createElement("h2");

        wordTag.innerHTML = solution;
        wordTag.id = "finishH2"

        finishedDiv.appendChild(wordTag);

        blueBoxDiv = document.createElement("div");
        blueBoxDiv.id="defBox";
        carouselWrapper = document.createElement("div");
        carouselWrapper.classList.add("carouselWrapper");
        carousel = document.createElement("div");
        carousel.classList.add("carousel");
        prevBtn = document.createElement("button");
        prevBtn.id="prevBtn";
        prevBtn.innerHTML="←";
        carouselText = document.createElement("p");
        carouselText.id="carouselText"
        carouselText.innerHTML=definitions[0];
        nextBtn = document.createElement("button");
        nextBtn.innerHTML="→";
        nextBtn.id="nextBtn";


        prevBtn.addEventListener("click", () => {
            currentDef = (currentDef - 1 + definitions.length) % definitions.length;
            updateMeaning();
          });
        
          nextBtn.addEventListener("click", () => {
            currentDef = (currentDef + 1) % definitions.length;
            updateMeaning();
          });

        carousel.appendChild(prevBtn);
        carousel.appendChild(carouselText);
        carousel.appendChild(nextBtn);
        carouselWrapper.appendChild(carousel);
        blueBoxDiv.appendChild(carouselWrapper);
        finishedDiv.appendChild(blueBoxDiv);
        
    }, 1500);

}

  
  
  
    function updateMeaning() {
        const textElement = document.getElementById("carouselText");
      textElement.textContent = definitions[currentDef];
    }
  

  