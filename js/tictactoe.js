 if(typeof TTT == 'undefined' || !TTT) var TTT = {};
TTT.feedback = null;
TTT.currentMarker = null;
TTT.numPlayers = null;
TTT.comMarker = null;
TTT.moveNum = 0;
TTT.gameInProgress = false;

  TTT.Cell = function() {
     this.value = null;
 }

 TTT.GameBoard = function(oDomBoard) {
     this.canvas = oDomBoard;
     this.context = oDomBoard.getContext("2d");
     this.height = oDomBoard.getAttribute('height');
     this.width = oDomBoard.getAttribute('width');
     this.board = [[new TTT.Cell(), new TTT.Cell(), new TTT.Cell()],
                  [new TTT.Cell(), new TTT.Cell(), new TTT.Cell()],
                  [new TTT.Cell(), new TTT.Cell(), new TTT.Cell()]];
     this.getCell = function(row,column){
         return this.board[row][column];
     }

     this.redraw = function() {

        for (x = 0; x <= TTT.gameBoard.height; x+=TTT.gameBoard.cellHeight) {
            TTT.gameBoard.context.moveTo(x, 0);
            TTT.gameBoard.context.lineTo(x, TTT.gameBoard.width);
        }

        for (y = 0; y <= TTT.gameBoard.width; y+=TTT.gameBoard.cellWidth) {
            TTT.gameBoard.context.moveTo(0,y);
            TTT.gameBoard.context.lineTo(TTT.gameBoard.height, y);
        }

         TTT.gameBoard.context.strokeStyle = "#000";
         TTT.gameBoard.context.stroke();

         TTT.gameBoard.context.font = "bold 46px sans-serif";

         for(r = 0; r < this.board.length; r++) {
             for(c = 0; c < this.board[r].length; c++) {
                 if(this.board[r][c].value != null)
                 {
                    this.context.fillText(this.board[r][c].value.toUpperCase(),(c*TTT.gameBoard.cellWidth)+(TTT.gameBoard.cellWidth/4 + TTT.gameBoard.cellWidth/10) ,(r*TTT.gameBoard.cellHeight)+(TTT.gameBoard.cellHeight/2 + TTT.gameBoard.cellHeight/6));
                 }
             }
         }

     }

     this.clear = function() {
         for(r = 0; r < this.board.length; r++) {
             for(c = 0; c < this.board[r].length; c++) {
                 this.board[r][c].value = null
             }
         }
         this.canvas.width = this.canvas.width;
     }

 }

 TTT.createBoard = function(oDomBoard) {
    TTT.gameBoard = new TTT.GameBoard(oDomBoard);
    TTT.gameBoard.clear();
    TTT.gameBoard.cellHeight = TTT.gameBoard.height / 3;
    TTT.gameBoard.cellWidth = TTT.gameBoard.width / 3;
    TTT.gameBoard.redraw();
 }

 TTT.getCursorPosition = function(e) {
    var x;
    var y;
    if (e.pageX != undefined && e.pageY != undefined) {
	x = e.pageX;
	y = e.pageY;
    }
    else {
	x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
	y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    x -=  TTT.gameBoard.canvas.offsetLeft;
    y -=  TTT.gameBoard.canvas.offsetTop;

    x = Math.min(x,  TTT.gameBoard.height * TTT.gameBoard.cellWidth);
    y = Math.min(y,  TTT.gameBoard.width * TTT.gameBoard.cellHeight);
    y = Math.floor(y/TTT.gameBoard.cellHeight);
    x = Math.floor(x/TTT.gameBoard.cellWidth)

    return {
        row: y,
        column: x
    };
}

TTT.isValidMove = function(row, column) {
    if(TTT.gameBoard.getCell(row,column).value == null)
    {
        return true;
    }
    TTT.feedback.innerHTML = "Can't do that.";
    return false;
}

TTT.switchCurrentMarker = function() {
    if(TTT.currentMarker == 'x')
    {
        TTT.currentMarker = 'o';
    }
     else if(TTT.currentMarker == 'o')
    {
        TTT.currentMarker = 'x';
    }
}

TTT.saveGameState = function() {
    if(!supports_html5_storage()){return false;}
    for(r = 0; r < TTT.gameBoard.board.length; r++) {
         for(c = 0; c < TTT.gameBoard.board[r].length; c++) {
             localStorage["TTT.row-"+r+".col-"+c] = TTT.gameBoard.board[r][c].value;
         }
     }
    localStorage["TTT.currentMarker"] = TTT.currentMarker;
    localStorage["TTT.numPlayers"] = TTT.numPlayers;
    localStorage["TTT.comMarker"] = TTT.comMarker;
    localStorage["TTT.moveNum"] = TTT.moveNum;
    localStorage["TTT.gameInProgress"] = TTT.gameInProgress;
    return true;
}

 TTT.onBoardClick = function(e) {

     var loc = TTT.getCursorPosition(e);
     if(TTT.isValidMove(loc.row,loc.column))
     {
         TTT.gameMove(loc.row,loc.column, TTT.currentMarker);
         TTT.gameBoard.redraw();
         
     }

     if(TTT.isGameOver())
     {
         TTT.endGame();
     }
     else if(TTT.isGameDraw())
     {
         TTT.endGame('draw');
     }
     else
     {
         TTT.nextPlayer();
     }
     TTT.saveGameState();
 }

 TTT.gameMove = function(row, col, marker) {
     TTT.gameBoard.getCell(row,col).value = marker;
     TTT.gameBoard.redraw();
     TTT.moveNum++;
 }

 TTT.nextPlayer = function() {
     TTT.switchCurrentMarker();
     TTT.updateTurnText();
     if(TTT.currentMarker == TTT.comMarker)
     {
         TTT.gameBoard.canvas.removeEventListener("click", TTT.onBoardClick, false);
         TTT.comMove();
     }
     else
     {
         TTT.gameBoard.canvas.addEventListener("click", TTT.onBoardClick, false);
     }
 }

 TTT.comMove = function() {
  var playerMarker = function () {
                        if(TTT.comMarker == 'x')return 'o';
                        return 'x';
                     }();
 
     //if I am about to win, win
     //if player is about to win, stop him
     //otherwise do a random move to an available space
     if(rowArr = TTT.canSomeoneWin(TTT.comMarker)) {
         TTT.comSpecificMove(rowArr);
         TTT.endGame();
     }else if(rowArr = TTT.canSomeoneWin(playerMarker)) {
         TTT.comSpecificMove(rowArr);
         TTT.nextPlayer();
     } else {
         TTT.comRandomMove();
         TTT.nextPlayer();
     }
 }

 TTT.comSpecificMove = function(moveArr) {
   if(moveArr[0] == 'horiz')
   {
        for(i = 0; i < 3; i++){
            if(TTT.gameBoard.board[moveArr[1]][i].value == null)
            {
                TTT.gameMove(moveArr[1],i, TTT.comMarker);
                break;
            }
        }
   }
   else if(moveArr[0] == 'vert')
   {
         for(i = 0; i < 3; i++){
            if(TTT.gameBoard.board[i][moveArr[1]].value == null)
            {
                TTT.gameMove(i, moveArr[1], TTT.comMarker);
                break;
            }
        }
   }
   else if(moveArr[0] == 'diag')
   {
        switch(moveArr[1]){
            case 1:
                for(i = 0; i < 3; i++){
                    if(TTT.gameBoard.board[i][i].value == null)
                    {
                        TTT.gameMove(i,i, TTT.comMarker);
                        break;
                    }
                }
                break;
            case 2:
                if(TTT.gameBoard.getCell(0,2).value == null)
                    TTT.gameMove(0,2, TTT.comMarker);
                else if(TTT.gameBoard.getCell(1,1).value == null)
                    TTT.gameMove(1,1, TTT.comMarker);
                else if(TTT.gameBoard.getCell(2,0).value == null)
                    TTT.gameMove(2,0, TTT.comMarker);
                break;
        }
   }
 }

TTT.comRandomMove = function() {
    //add all empty cell locations into an array and randomly select an index
    var possibleMoves = new Array();

    for(r = 0; r < TTT.gameBoard.board.length; r++) {
         for(c = 0; c < TTT.gameBoard.board[r].length; c++) {
             if(TTT.gameBoard.board[r][c].value == null)
             {
                possibleMoves.push([r,c])
             }
         }
     }

     var randIndex = Math.round(Math.random() * (possibleMoves.length - 1));
     TTT.gameMove(possibleMoves[randIndex][0], possibleMoves[randIndex][1], TTT.comMarker);
}

 TTT.canSomeoneWin = function(marker) {
    //check horizontal
    for(i = 0; i < 3; i++) {
         if(TTT.checkThreeCells(TTT.gameBoard.board[0][i], TTT.gameBoard.board[1][i] ,TTT.gameBoard.board[2][i], marker) == true)
             return ['vert',i];
     }

     //check vertical
      for(i = 0; i < 3; i++) {
         if(TTT.checkThreeCells(TTT.gameBoard.board[i][0], TTT.gameBoard.board[i][1] ,TTT.gameBoard.board[i][2], marker) == true)
             return ['horiz',i];
     }

     //check diagonal
     if(TTT.checkThreeCells(TTT.gameBoard.board[0][0], TTT.gameBoard.board[1][1] ,TTT.gameBoard.board[2][2],marker) == true)
         return ['diag',1];
     else if(TTT.checkThreeCells(TTT.gameBoard.board[0][2], TTT.gameBoard.board[1][1] ,TTT.gameBoard.board[2][0],marker) == true)
         return ['diag',2];

     return false;
 }

 TTT.checkThreeCells = function(cell1, cell2, cell3, marker) {
     if(cell1.value == cell2.value && cell1.value == marker && cell3.value == null)
         return true;

     if(cell2.value == cell3.value && cell2.value == marker && cell1.value == null)
         return true;

     if(cell1.value == cell3.value && cell1.value == marker && cell2.value == null)
         return true;
     
     return false;
 }

 TTT.updateTurnText = function() {
     if(TTT.numPlayers == 1 && TTT.currentMarker == TTT.comMarker)
        TTT.feedback.innerHTML = "Computer will move for " + TTT.currentMarker.toUpperCase();
     else
        TTT.feedback.innerHTML = TTT.currentMarker.toUpperCase() + "'s turn.";
 }

 TTT.isGameOver = function() {
     if(TTT.checkHorizontal() || TTT.checkVertical() || TTT.checkDiagonal())
         return true;

     return false;
 }

 TTT.isGameDraw = function() {
     if(TTT.moveNum >= 9)
         return true;

     return false;
 }
 
 TTT.checkHorizontal = function() {
     for(i = 0; i < 3; i++) {
         if(TTT.compareCells(TTT.gameBoard.board[0][i], TTT.gameBoard.board[1][i] ,TTT.gameBoard.board[2][i]) == true)
             return true;
     }
     return false;
 }

 TTT.checkVertical = function() {
     for(i = 0; i < 3; i++) {
         if(TTT.compareCells(TTT.gameBoard.board[i][0], TTT.gameBoard.board[i][1] ,TTT.gameBoard.board[i][2]) == true)
             return true;
     }
     return false;
 }

 TTT.checkDiagonal = function() {

     if(TTT.compareCells(TTT.gameBoard.board[0][0], TTT.gameBoard.board[1][1] ,TTT.gameBoard.board[2][2]) == true)
         return true;
     else if(TTT.compareCells(TTT.gameBoard.board[0][2], TTT.gameBoard.board[1][1] ,TTT.gameBoard.board[2][0]) == true)
         return true;

     return false;
 }

TTT.compareCells = function(cell1, cell2, cell3) {
    if( (typeof cell1 != 'undefined' && typeof cell2 != 'undefined' && typeof cell3 != 'undefined') &&
        (cell1.value == cell2.value && cell2.value == cell3.value) && cell1.value != null)
        {
            return true
        }

    return false;
}

TTT.endGame = function(type) {
    var text;
    if(type == 'draw')
        text  = "The game has ended in a draw!";
    else
        text = "Congratulations " + TTT.currentMarker.toUpperCase() + "'s!";

    text += "&nbsp;&nbsp;<a href=\"\" onclick=\"javascript:TTT.newGame(document.getElementById('board'));\">Play Again</a>";
    TTT.feedback.innerHTML = text;
    TTT.gameBoard.canvas.removeEventListener("click", TTT.onBoardClick, false);
    TTT.gameInProgress = false;
    localStorage.clear();
}

 TTT.setUpTurn = function(e) {
     if(typeof e != 'undefined' || TTT.numPlayers)
     {
         if(document.getElementById('numPlayers'))
         {
             if(!TTT.numPlayers){
                TTT.numPlayers = e.target.getAttribute('id');
             }
             TTT.feedback.innerHTML = "Who will go first?  <span id='x'>X</span> or <span id='o'>O</span>";
         }
         else {
            if(TTT.currentMarker == null){
                TTT.currentMarker = e.target.getAttribute('id');
            }
            
            if(TTT.numPlayers == 1)
            {
                TTT.comMarker = function() {
                                            if(TTT.currentMarker == 'x')return 'o';
                                            return 'x';
                                        }();
            }
            if(TTT.moveNum > 0) {
                TTT.feedback.innerHTML = TTT.currentMarker.toUpperCase() + " will resume.";
            } else {
                TTT.feedback.innerHTML = "OK, " + TTT.currentMarker.toUpperCase() + " will start.";
            }
            TTT.gameBoard.canvas.addEventListener("click", TTT.onBoardClick, false);
            return true;
         }
     }
     else
     {
         TTT.feedback.innerHTML = "<div id='numPlayers'>How many players? <span id='1'>1</span> or <span id='2'>2</span></div>";
     }
     return false;
 }

 TTT.newGame = function() {
     localStorage.clear();
     TTT.initGame(TTT.gameboard.canvas);
 }

 TTT.resumeGame = function() {
     if(!supports_html5_storage()){return false;}
     TTT.gameInProgress = (localStorage["TTT.gameInProgress"] == "true");
     

     if(!TTT.gameInProgress){return false;}

     for(r = 0; r < TTT.gameBoard.board.length; r++) {
         for(c = 0; c < TTT.gameBoard.board[r].length; c++) {
             TTT.gameBoard.board[r][c].value = function(){
                                                        if(localStorage["TTT.row-"+r+".col-"+c] == "null")
                                                            return null;
                                                        else return localStorage["TTT.row-"+r+".col-"+c];
                                                    }();
         }
     }
    TTT.gameBoard.redraw();
    TTT.currentMarker = localStorage["TTT.currentMarker"];
    TTT.numPlayers = parseInt(localStorage["TTT.numPlayers"]);
    TTT.comMarker = localStorage["TTT.comMarker"];
    TTT.moveNum = parseInt(localStorage["TTT.moveNum"]);
     return true;
 }

 TTT.initGame = function(oDomBoard){
     TTT.createBoard(oDomBoard);
     
     if(!TTT.resumeGame()){
         //set default values
         TTT.moveNum = 0;
         TTT.numPlayers = 0;
         TTT.gameInProgress = true;
     }
     
     TTT.feedback = document.getElementById('feedback');
     TTT.feedback.addEventListener("click",TTT.setUpTurn,false);
     
    TTT.setUpTurn();
        

 }