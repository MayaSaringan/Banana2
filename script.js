/* COMP 3008: Project 2 
 * Names: 
 *  Daniel Sturk
 *  Luke Connolly
 *	Maya Saringan (101001759)
 * 	Vesh Yami Diaby
 *
 *  Script that implements the password scheme, as well as communicates
 *  with a database to store the password data.
 *  
 *  Updated: March 31, 2018
*/

/* CONSTANTS================ */
/* SCHEME BASIS VALUES */
var NUM_DIRECTIONS = 8;
var DIRECTIONS = ["left","top-left","top","top-right","right","bottom-right","bottom","bottom-left"];
var NUM_LIST_PER_PWD = 7;
var LIST_SIZE = 8;

/* PROJECT REQUIREMENTS VALUES */
var MAX_LOGIN_FAILURES = 3;
var EMAIL_MODE= 0;
var BANK_MODE=1;
var SHOP_MODE=2;


/* HTML IDs & CLASSes*/
//common:
var PWD_INSTRUCTIONS_CLASS = "instructions";
var FAILED_PWD_CLASS ="failed-pwd";
var SUCCESS_PWD_CLASS = "success-pwd";
var TRY_PWD_CLASS = "try-pwd";
var SAVE_PWD_CLASS ="save-pwd";
var CREATE_PWD_CLASS = "create-pwd";
//intro:
var INTRODUCTION_FIELD_ID = "introduction";
//emails:
var EMAIL_FIELD_ID = "email-field";
var EMAIL_CHART_ID = "email_chart_div";
//bank:
var BANK_FIELD_ID = "bank-field";
var BANK_CHART_ID = "bank_chart_div";
//shop:
var SHOP_FIELD_ID = "shop-field";
var SHOP_CHART_ID = "shop_chart_div";
//test
var TEST_FIELD_ID = "test-field";
var TEST_CHART_ID = "test_chart_div";
var TESTING_ATTEMPTS_ID = "testing-attempts";
var FAILED_PWD_TEST_ID = "failed-pwd-test";
var SUCCESS_PWD_TEST_ID = "success-pwd-test";
var TEST_PROCEED_PROMPT_ID = "test-pwd-prompt";
var SUCCESS_INDV_TEST_ID = "test-success-indv";
var FAILED_INDV_TEST_ID = "test-failed-indv";
var TEST_BUTTON_ID = "test-next-pwd";
var TRY_PWD_TEST_ID = "try-test";
//last page:
var SUMM_FIELD_ID = "summary-field";
/* DATABASE PATHS */
var USER_COUNT_REF = "userCount/";
var LIST_VALUES_REF = "listValues/";

/* LOG DATA */
var logActivity =false;
var log = {};//will be an object whose key is a timestamp

/* USER-SPECIFIC */
var user_id = null;	

/* STATISTICS */
var userCount = 0;
var gen_startDates = {0:null,1:null,2:null};
var gen_endDates = {0:null, 1:null,2:null};
//var gen_numAttempts = {0:0,1:0,2:0};
var gen_numSuccesses = {0:0,1:0,2:0};
var gen_numFailures = {0:0,1:0,2:0};



/* HELPER VALUES */
var ALPHABET_STRING = "abcdefghijklmnopqrstuvwxyz";
var ALPHABET_LENGTH = 8;//26;
var NUM_MODES = 3;
var numTested = 0;
var modes = {0:EMAIL_MODE,1:BANK_MODE,2:SHOP_MODE};

//wait for google stuff to load
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(start);

/*
 * Grabs sets of all possible words from the database and invokes a function
 * that will create a password.
 */
function createPWDChain(mode){
	var listValues = null;  //will contain a set of all possible words the software accounts for
	var userWordLists = {}; //will contain the necessary details for the password
	
	/* Fetch list of all words used for the software from the database */
	firebase.database().ref(LIST_VALUES_REF).on("value",function(snapshot){
		listValues = snapshot.val();
		
		//create a password: 
		makePWDPart(1,userWordLists,listValues,mode);
	});	
}


/* ================================================*/





function promptOnSuccessfulTry(list, mode, showAnswer){
	var fieldID;
	var chartID;
	
	switch(mode){
		case EMAIL_MODE:
			fieldID = EMAIL_FIELD_ID;
			chartID = EMAIL_CHART_ID;
			break;
		case BANK_MODE:
			fieldID = BANK_FIELD_ID;
			chartID = BANK_CHART_ID;
			break;
		case SHOP_MODE:
			fieldID = SHOP_FIELD_ID;
			chartID = SHOP_CHART_ID;
			break;
	}

	$("#"+fieldID+" > ."+ SUCCESS_PWD_CLASS).show();
	$("#"+chartID).hide();
	$("#"+fieldID+" > ."+TRY_PWD_CLASS).show();
	$("#"+fieldID+" > ."+TRY_PWD_CLASS).unbind('click').click(function(){
		$("#"+fieldID+" > ."+ SUCCESS_PWD_CLASS).hide();
			$("#"+fieldID+" > ."+SAVE_PWD_CLASS).hide();
		$("#"+fieldID+" > ."+TRY_PWD_CLASS).hide();
		checkPWDPart(1,list,mode, showAnswer);
	});
	$("#"+fieldID+" > ."+SAVE_PWD_CLASS).show();
	$("#"+fieldID+" > ."+SAVE_PWD_CLASS).unbind('click').click(function(){
			savePWD(list, mode);
	});
}

function promptOnFailedTry(list, mode, showAnswer){
	var fieldID;
	var chartID;
	
	switch(mode){
		case EMAIL_MODE:
			fieldID = EMAIL_FIELD_ID;
			chartID = EMAIL_CHART_ID;
			break;
		case BANK_MODE:
			fieldID = BANK_FIELD_ID;
			chartID = BANK_CHART_ID;
			break;
		case SHOP_MODE:
			fieldID = SHOP_FIELD_ID;
			chartID = SHOP_CHART_ID;
			break;
	}

	$("#"+fieldID+" > ."+ FAILED_PWD_CLASS).show();
	$("#"+chartID).hide();
	$("#"+fieldID+" > ."+TRY_PWD_CLASS).show();
	$("#"+fieldID+" > ."+TRY_PWD_CLASS).unbind('click').click(function(){
		$("#"+fieldID+" > ."+ FAILED_PWD_CLASS).hide();
		$("#"+fieldID+" > ."+TRY_PWD_CLASS).hide();
			checkPWDPart(1,list,mode, showAnswer);
	});
}



function checkPWDPart(listNum, list, mode, showAnswer){
		console.log("list: ");
	console.log(list);
	function selectHandler(chart) {
		var selectedItem = chart.getSelection()[0];
		if(selectedItem){ 
			/* Correct choice chosen */
			if (list[listNum]["choice"] == DIRECTIONS[selectedItem.row] ){
				if (listNum < NUM_LIST_PER_PWD) checkPWDPart(++listNum,list, mode, showAnswer);
				else if (listNum >= NUM_LIST_PER_PWD) promptOnSuccessfulTry(list, mode, showAnswer);
			}else  promptOnFailedTry(list, mode, showAnswer);
		}
	}
	
	switch(mode){
		case EMAIL_MODE:
			list["title"] = "Email Password";
			createChart(listNum,list,EMAIL_CHART_ID,showAnswer,selectHandler,mode);break;
		case BANK_MODE:
			list["title"] = "Bank Password";
			createChart(listNum,list,BANK_CHART_ID,showAnswer,selectHandler,mode);break;
		case SHOP_MODE:
			list["title"] = "Shop Password";
			createChart(listNum,list,SHOP_CHART_ID,showAnswer,selectHandler,mode);break;
	}
}


function testPWDPart(listNum,list,mode,showAnswer,numFails){
	console.log("test list: ");
	console.log(list);	$("#test-field > h3").html("Testing your "+list["title"]+" password:");
	$("#"+TESTING_ATTEMPTS_ID).html(numFails);
	var fired = false;
	function selectHandler(chart) {
		var selectedItem = chart.getSelection()[0];
		if (selectedItem && !fired) {
			fired = true;
			if (list[listNum]["choice"] == DIRECTIONS[selectedItem.row] ){
				chart.clearChart();
				if (listNum<NUM_LIST_PER_PWD) testPWDPart(++listNum,list,mode,showAnswer,numFails);
				else if (listNum>=NUM_LIST_PER_PWD)promptOnSuccessfulTest(list, mode,numFails);
			}else {
				chart.clearChart();promptOnFailedTest(list, mode,numFails)
			}
			console.log(list);
		}
	}
	
	createChart(listNum,list,"test_chart_div",showAnswer,selectHandler,mode);
	
}

function promptOnSuccessfulTest(list, mode,numFails){
	$("#"+TEST_CHART_ID).hide();
	$("#"+SUCCESS_PWD_TEST_ID).show();
	$("#"+TESTING_ATTEMPTS_ID).html(++numFails);
		$("#"+TEST_PROCEED_PROMPT_ID).show();
	$("#"+SUCCESS_INDV_TEST_ID).show();
	if (numTested>NUM_MODES) $("#"+TEST_BUTTON_ID).html("Done All Tests");
	$("#"+TEST_BUTTON_ID).unbind('click').click(function(){
		$("#"+TEST_PROCEED_PROMPT_ID).hide();
		$("#"+SUCCESS_INDV_TEST_ID).hide();
		$("#"+SUCCESS_PWD_TEST_ID).hide();
		numTested++;
		if (numTested<=NUM_MODES){
			nextTest();
		}else {$("#"+TEST_FIELD_ID).hide();
			$("#"+SUMM_FIELD_ID).show();
		}
		
		
	});



}
function nextTest(){		
	var count =0;
	var modeToTest = -1;
	for (var o in modes){
		if (Math.random()<1/++count){
				modeToTest = o;break;
		}
	}
	delete modes[modeToTest];
	var pwdPath = "";
	console.log(modeToTest);
	if (modeToTest==EMAIL_MODE) pwdPath = "email-pwd/";
	else if (modeToTest==BANK_MODE) pwdPath = "bank-pwd/";
	else if (modeToTest == SHOP_MODE) pwdPath = "shop-pwd/";
	console.log(modes.toString());console.log(pwdPath);
	firebase.database().ref("userCredentials/"+user_id+"/"+pwdPath).on("value",function(snapshot){
		list = snapshot.val();
		console.log(list);
		testPWDPart(1,list,modeToTest,false,0);
	});
}
function promptOnFailedTest(list, mode,numFails){
	$("#"+TEST_CHART_ID).hide();
	$("#"+FAILED_PWD_TEST_ID).show();	
	numFails++;$("#"+TESTING_ATTEMPTS_ID).html(numFails);
	//see how many times there has been a failure
	console.log ("numfails : "+numFails);
	if (numFails>=MAX_LOGIN_FAILURES){$("#"+TRY_PWD_TEST_ID).hide();
		
		$("#"+TEST_PROCEED_PROMPT_ID).show();
		$("#"+FAILED_INDV_TEST_ID).show();
		$("#"+TEST_BUTTON_ID).unbind('click').click(function(evt){
			evt.stopPropagation();
			$("#"+TEST_PROCEED_PROMPT_ID).hide();
			$("#"+FAILED_INDV_TEST_ID).hide();
			$("#"+FAILED_PWD_TEST_ID).hide();
numTested++;
			console.log("numTested: "+numTested);
			if (numTested<=NUM_MODES){
				
				nextTest();
			}else {
			$("#"+TEST_FIELD_ID).hide();
						$("#"+SUMM_FIELD_ID).show();
			//	console.log("i wanna hide everything");
			}
			
			
		});
	}else{
		$("#"+TRY_PWD_TEST_ID).show();
		$("#"+TRY_PWD_TEST_ID).click(function(evt){
			evt.stopPropagation();
			$("#"+FAILED_PWD_TEST_ID).hide();	
			$("#"+TRY_PWD_TEST_ID).hide();
				testPWDPart(1,list,mode, false,numFails);
		});
		
	}

}
function savePWD(userWordLists, mode){
	
	switch(mode){
		case EMAIL_MODE: 
			
			firebase.database().ref("userCredentials/"+user_id+"/").update({"email-pwd":userWordLists});
			$("#"+EMAIL_FIELD_ID).hide();break;
		case BANK_MODE: 
			
			firebase.database().ref("userCredentials/"+user_id+"/").update({"bank-pwd":userWordLists});
			$("#"+BANK_FIELD_ID).hide();break;
		case SHOP_MODE: 
			firebase.database().ref("userCredentials/"+user_id+"/").update({"shop-pwd":userWordLists});
			$("#"+SHOP_FIELD_ID).hide();break;
	}
	
	//move on to creating next password, or if theyre all created go to testing
	switch(mode){
		case EMAIL_MODE:
			//create banking pwd next
			bankPWD();
			break;
		case BANK_MODE:
			shopPWD();
			break;
		case SHOP_MODE:
			testPWDS();
			break;
	}
	//
}

function testPWDS(){
	$("#"+TEST_FIELD_ID).show();
	var modeToTest = Math.floor(Math.random()*NUM_MODES);
		//remove from list of modes left
	delete modes[modeToTest];
	var pwdPath = "";
	switch(modeToTest){
		case EMAIL_MODE:pwdPath = "email-pwd/";break;
		case BANK_MODE:pwdPath = "bank-pwd/";break;
		case SHOP_MODE:pwdPath = "shop-pwd/";break;
	}console.log(modeToTest);console.log(pwdPath);console.log(modes.toString());
	firebase.database().ref("userCredentials/"+user_id+"/"+pwdPath).on("value",function(snapshot){
		list = snapshot.val();
		console.log(list);
		
		numTested++;
		testPWDPart(1,list,modeToTest,false,0);
	});
	//});
}
function makePWDPart(listNum,userWordLists,listValues,mode){
	
	/* GENERATE A LIST FOR THIS USER */
	var list = {};
	var temp_alphabet_string = ALPHABET_STRING;
	
	for (var i=0;i<LIST_SIZE;i++){
		//choose a letter
		var randLetterIndex = Math.floor(Math.random()*(ALPHABET_LENGTH-i));
		var letter = temp_alphabet_string[randLetterIndex];
		
		//find a random word starting with <letter> from database
		var count =0;
		var randWordIndex = -1;
		for (var o in listValues[letter]){
			if (Math.random()<1/++count){
				if (o!="count"){
					randWordIndex = o;break;
				}
			}
		}
		
		//add word to list
		list[DIRECTIONS[i]] = listValues[letter][randWordIndex];
		
		//remove letter used from alphabet to prevent a word starting with the same letter being in the same set
		temp_alphabet_string = temp_alphabet_string.slice(0,randLetterIndex)+temp_alphabet_string.slice(randLetterIndex+1,temp_alphabet_string.length);
		//remove from list of all possible words the words that has just been used to prevent it from appearing in future sets
		delete listValues[letter][randWordIndex];
		listValues[letter]["count"]--; 
	}
	
	/* ==========FINISHED GENERATING WORDS FOR LIST=========*/
	
	/* =========CHOOSE A WORD & SET AS THE CHOICE =======*/
	var answerInt  = Math.floor(Math.random()*NUM_DIRECTIONS);
	userWordLists[listNum] = {"list":list,"choice": DIRECTIONS[answerInt] };
	
	/* if we have all lists for a password, password is generated and user can now test it*/
	if (listNum == NUM_LIST_PER_PWD){
		
		var actionMsg = ""; //differs with modes
		switch (mode){
			case EMAIL_MODE: actionMsg ="generated_email_pwd";break;
			case BANK_MODE: actionMsg = "generated_bank_pwd";break;
			case SHOP_MODE: actionMsg = "generated_shop_pwd";break;
		}
		log[new Date()] = {"id":user_id,"action":actionMsg,"pwd":userWordLists};
		console.log(log);
		
		/* make user practice it */
		checkPWDPart(1,userWordLists, mode, true);
	}
	/* otherwise, keep making the password */
	else	makePWDPart(++listNum, userWordLists, listValues, mode);
	
}

function createChart(listNum,list,divID,showAnswer,handlerFunc,mode){
	// Create the data table that will populate image: 
	var data = new google.visualization.DataTable();
	data.addColumn('string', 'Direction');
	data.addColumn('number', 'Slices');
	console.log(listNum);
	console.log(list);
	data.addRows([
		[list[listNum]["list"]["left"], 1],
		[list[listNum]["list"]["top-left"], 1],
		[list[listNum]["list"]["top"], 1], 
		[list[listNum]["list"]["top-right"], 1],
		[list[listNum]["list"]["right"], 1],
		[list[listNum]["list"]["bottom-right"], 1],
		[list[listNum]["list"]["bottom"], 1],
		[list[listNum]["list"]["bottom-left"], 1],
		["none", 0]
	]);
	var sliceStyle={};
	if (showAnswer){
		var actualChoice = list[listNum]["choice"];
		console.log("actual choice:"+list[listNum]["choice"]);
		//try to find outerHTML what slice it is wordiwse
		if (actualChoice =="left") sliceStyle ={ 0:{color:'black'}};
		else if (actualChoice =="top-left")  sliceStyle ={ 1:{color:'black'}};
		else if (actualChoice =="top") sliceStyle ={ 2:{color:'black'}};
		else if (actualChoice =="top-right")  sliceStyle ={ 3:{color:'black'}};
		else if (actualChoice =="right") sliceStyle ={ 4:{color:'black'}};
		else if (actualChoice =="bottom-right") sliceStyle ={ 5:{color:'black'}};
		else if (actualChoice =="bottom") sliceStyle ={ 6:{color:'black'}};
		else if (actualChoice =="bottom-left") sliceStyle ={ 7:{color:'black'}};
	}
	
	// Set chart options
	var options = {title:list["title"],
				   width:400,
				   height:300,
				   pieSliceText: 'label',
				   legend: 'none',
				   pieStartAngle: -115,
				   slices: sliceStyle};
	
	// Instantiate and draw our chart, passing in some options.
	var chart = new google.visualization.PieChart(document.getElementById(divID));

	google.visualization.events.addListener(chart, 'select', function () {
						handlerFunc(chart);
						});    
	//37 left  |   38 up  |   39 right   |   40 down
	//65 a     |   87 w   |   68   d     |   83 s
	var fired =false;
	var arrowKeys = {37:false, 38:false, 39:false, 40:false,
					65: false, 87: false, 68: false, 83: false};
	function z(d){
		for(var key in arrowKeys) {
			if(arrowKeys[key] && key != d) {
				return true;
			}
		}
		return false;
	}
	$("html").keydown(function(e) {
		if (e.keyCode in arrowKeys && !fired ) {
			
			arrowKeys[e.keyCode] = true;
			//check if left and up is pressed
			if ((arrowKeys[37] || arrowKeys[65]) &&  (arrowKeys[38] || arrowKeys[87]) ){
				$("#log").html("left up pressed");
				 chart.setSelection([{row: 1}]);
				 handlerFunc(chart);
				 fired=true;
			}
			//check if up and right is pressed
			else if ((arrowKeys[38] || arrowKeys[87]) &&  (arrowKeys[39] || arrowKeys[68]) ){
				$("#log").html("u pright pressed");
				chart.setSelection([{row: 3}]);
				 handlerFunc(chart);
				 fired=true;
			}
			//check if right and down is pressed
			else if ((arrowKeys[39] || arrowKeys[68]) &&  (arrowKeys[40] || arrowKeys[83]) ){
				$("#log").html("right down pressed");
				chart.setSelection([{row: 5}]);
				 handlerFunc(chart);
				 fired=true;
			}
			//check if left down is pressed
			else if ((arrowKeys[40] || arrowKeys[83]) &&  (arrowKeys[37] || arrowKeys[65]) ){
				$("#log").html("left down pressed");
				chart.setSelection([{row:7}]);
				 handlerFunc(chart);
				 fired=true;
				 
			}
		}
	}).keyup(function(e) {
		if (e.keyCode in arrowKeys && !fired) {
			
			if ((arrowKeys[37] || arrowKeys[65]) && !z(37)){
				$("#log").html("left pressed");
				chart.setSelection([{row: 0}]);fired=true;
				 handlerFunc(chart);
				 
			}
			//check if up only pressed
			else if ((arrowKeys[38] || arrowKeys[87])&& !z(38) ){
				$("#log").html("up pressed");
				chart.setSelection([{row: 2}]); fired=true
				 handlerFunc(chart);
				;
			}
			//check if right only pressed
			else if ((arrowKeys[39] || arrowKeys[68])&& !z(39) ){
				$("#log").html("right pressed");
				chart.setSelection([{row: 4}]); fired=true;
				 handlerFunc(chart);
				
			}
			//check if down only pressed
			else if ((arrowKeys[40] || arrowKeys[83])&& !z(40) ){
				$("#log").html("down pressed");
				chart.setSelection([{row: 6}]);fired=true;
				 handlerFunc(chart);
				
			}
			arrowKeys[e.keyCode] = false;
		}
	});

	chart.draw(data, options);
	$("#"+divID).show();
}
	

function start() {
	//connect to the database
	var config = {
		apiKey: "AIzaSyB5NWPS-FMz28zlSC72VMpTMaQc1r9d0xY",
		authDomain: "comp-3008.firebaseapp.com",
		databaseURL: "https://comp-3008.firebaseio.com",
		projectId: "comp-3008",
		storageBucket: "comp-3008.appspot.com",
		messagingSenderId: "1023908821307"
	};
	firebase.initializeApp(config);
	
	/* activity starts being logged whenever the user clicks this button */
	$("#start-process").click(function(){
		
		/* GENERATE USER ID -- assign default value -1*/
		user_id = firebase.database().ref("userCredentials/").push(-1).key;		
		/* update user count stat */
		firebase.database().ref("userCount/").transaction(function(id){
			id +=1;
			return id;
		});
		
		$("#introduction").hide();		
		startPWDs();		
	});
	
	
}

function startPWDs(){
	/* log a user starting the password process -> start with email*/
	log[new Date()] = {"id":user_id,"action":"requested_email_pwd"};
	$("#"+EMAIL_FIELD_ID).show();
	createPWDChain(EMAIL_MODE);
}
function bankPWD(){

	log[new Date()] = {"id":user_id,"action":"requested_bank_pwd"};
	$("#"+BANK_FIELD_ID).show();
	createPWDChain(BANK_MODE);	
	
}
function shopPWD(){

	log[new Date()] = {"id":user_id,"action":"requested_shop_pwd"};
	$("#"+SHOP_FIELD_ID).show();
	createPWDChain(SHOP_MODE);	
	
}
