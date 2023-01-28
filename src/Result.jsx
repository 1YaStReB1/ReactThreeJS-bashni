import React from 'react'
import "./result.css"

const Result = ({score, setScore,startGame,gameEnded,setGameEnded}) => {

  window.addEventListener("keydown", function (event) {
    if (event.key === "R" || event.key === "r") {
      
      return;
    }
  });

  return (
    <div className="results">
  <div className="content">
    <p>Гаме овер</p>
    <p>{`Ваш результат: ${score}`}</p>
    <button onClick={()=>{setGameEnded(false); startGame(); setScore(2);}}>Рестарт</button>
   
  </div>
</div>
  )
}

export default Result