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
 *  Updated: April 2, 2018
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


/* USER-SPECIFIC */
var user_id = null;	

/* STATISTICS */
var P_LOGINS = "p_total";
var P_SUCCESSFUL_LOGINS = "p_successes";
var P_FAILED_LOGINS = "p_fails";
var T_LOGINS = "t_total";
var T_SUCCESSFUL_LOGINS = "t_successes";
var T_FAILED_LOGINS = "t_fails";
var userStatistics = {
	"p_total":{
		"total":0,
		"success":0,
		"avgSuccessDuration":0,
		"fail":0,
		"avgFailDuration":0
	},
	"p_successes":[],
	"p_fails":[],
	"t_total":{
		"total":0,
		"success":0,
		"avgSuccessDuration":0,
		"fail":0,
		"avgFailDuration":0
	},
	"t_successes":[],
	"t_fails":[]
}

var globalStatistics = {
	"p_total":{
		"total":0,
		"success":0,
		"avgSuccessDuration":0,
		"fail":0,
		"avgFailDuration":0
	},
	"p_successes":[],
	"p_fails":[],
	"t_total":{
		"total":0,
		"success":0,
		"avgSuccessDuration":0,
		"fail":0,
		"avgFailDuration":0
	},
	"t_successes":[],
	"t_fails":[]
}
/* HELPER VALUES */
var SUCCESS = "success";
var FAILURE="failure";
var ALPHABET_STRING = "abcdefghijklmnopqrstuvwyz";//x is omitted 
var ALPHABET_LENGTH = 25;
var NUM_MODES = 3;
var numTested = 0;
var modes = {0:EMAIL_MODE,1:BANK_MODE,2:SHOP_MODE};
var titleList = {0:"Email Password",1:"Bank Password",2:"Shop Password"};
var chart_id_list = {0:EMAIL_CHART_ID,1:BANK_CHART_ID,2:SHOP_CHART_ID};
var field_id_list = {0:EMAIL_FIELD_ID,1:BANK_FIELD_ID,2:SHOP_FIELD_ID};
var showAnswer = true;
var p_modeTypeString = {0:"practice_email",1:"practice_bank",2:"practice_shop"};
var t_modeTypeString = {0:"test_email",1:"test_bank",2:"test_shop"};
var modeString = {0:"email",1:"bank",2:"hop"};

/*LOG MESSAGES*/
var P_EMAIL = "practice_email";
var REQ_PWD="requested_pwd";

/* ================================================*/
/*
 * Sends a log object to the database, containing the 
 * <eventMsg>,<passwordType>,<pwd>
 */
function addLog(eventMsg, passwordType, pwd){
	if (passwordType==-1 && pwd==-1){
		firebase.database().ref("log/"+new Date()+"/").push({
			"id":user_id,
			"event":eventMsg
		});
	}else if (passwordType!=-1 && pwd==-1){
		firebase.database().ref("log/"+new Date()+"/").push({
			"id":user_id,
			"event":eventMsg,
			"password_type":passwordType,
		});
	}else{
		firebase.database().ref("log/"+new Date()+"/").push({
			"id":user_id,
			"event":eventMsg,
			"password_type":passwordType,
			"password":pwd
		});
	}
}
/* ================================================*/
/*
 * Pushes login data to the database at path <DBpath>
 * 
 */
function pushLoginDataToDB(DBpath,duration,mode){
	firebase.database().ref(DBpath).push({
		"user_id":user_id,
		"duration":duration,
		"mode":titleList[mode]

	});	 
}


/* ================================================*/
/*
 * Changes the statistics for login totals on the database
 * 
 */
function alterDBStatistics(section,duration,success){
	if (success==SUCCESS){
		//alter data on the database
		var newTotal  =globalStatistics[section]["total"]+1;
		var newSucc = globalStatistics[section]["success"]+1;
		var newAvg = ((globalStatistics[section]["avgSuccessDuration"]*globalStatistics[section]["success"])
						+duration)/
					newSucc;
		firebase.database().ref("statistics/login_info/"+section+"/").update(
			{"total":newTotal,"success":newSucc,"avgSuccessDuration":newAvg});	
	}else{
		//alter data on the database
		var newTotal  =globalStatistics[section]["total"]+1;
		var newFail = globalStatistics[section]["fail"]+1;
		var newAvg = ((globalStatistics[section]["avgFailDuration"]*globalStatistics[section]["fail"])
						+duration)/
					newFail;
		firebase.database().ref("statistics/login_info/"+section+"/").update(
			{"total":newTotal,"fail":newFail,"avgFailDuration":newAvg});			
	}
	
}
/* ================================================*/
/*
 * Alters global variables tracking login statistics for this user,
 * and adds this users statistics to the database.
 */
function addLoginData(success, duration, mode,sessionType){
	console.log(duration);
	if (sessionType =="practice"){
		if (success == SUCCESS){
			userStatistics[P_SUCCESSFUL_LOGINS].push( 
			{
				"duration":duration,
				"mode":titleList[mode]
			});
			
			//alter global variables client side
			userStatistics[P_LOGINS]["total"]++;		
			userStatistics[P_LOGINS]["avgSuccessDuration"] = 
				((userStatistics[P_LOGINS]["avgSuccessDuration"]*userStatistics[P_LOGINS]["success"])
				+ duration)/++userStatistics[P_LOGINS]["success"];
				
			//alter data on the database
			alterDBStatistics(P_LOGINS,duration,success);
			pushLoginDataToDB("statistics/login_info/"+P_SUCCESSFUL_LOGINS+"/",duration,mode);
		}else if (success == FAILURE){
			userStatistics[P_FAILED_LOGINS].push( 
			{
				"duration":duration,
				"mode":titleList[mode]
			});
			userStatistics[P_LOGINS]["total"]++;		
			userStatistics[P_LOGINS]["avgFailDuration"] = 
				((userStatistics[P_LOGINS]["avgFailDuration"]*userStatistics[P_LOGINS]["fail"])
				+ duration)/++userStatistics[P_LOGINS]["fail"];
			//alter data on the database
			alterDBStatistics(P_LOGINS,duration,success);
			pushLoginDataToDB("statistics/login_info/"+P_FAILED_LOGINS+"/",duration,mode);
		}

	}else if(sessionType=="test"){
		if (success == SUCCESS){
			userStatistics[T_SUCCESSFUL_LOGINS].push( 
			{
				"duration":duration,
				"mode":titleList[mode]
			});
			userStatistics[T_LOGINS]["total"]++;		
			userStatistics[T_LOGINS]["avgSuccessDuration"] = 
				((userStatistics[T_LOGINS]["avgSuccessDuration"]*userStatistics[T_LOGINS]["success"])
				+ duration)/++userStatistics[T_LOGINS]["success"];
			//alter data on the database
			alterDBStatistics(T_LOGINS,duration,success);
			pushLoginDataToDB("statistics/login_info/"+T_SUCCESSFUL_LOGINS+"/",duration,mode);
		}else if (success == FAILURE){
			userStatistics[T_FAILED_LOGINS].push( 
			{
				"duration":duration,
				"mode":titleList[mode]
			});
			userStatistics[T_LOGINS]["total"]++;		
			userStatistics[T_LOGINS]["avgFailDuration"] = 
				((userStatistics[T_LOGINS]["avgFailDuration"]*userStatistics[T_LOGINS]["fail"])
				+ duration)/++userStatistics[T_LOGINS]["fail"];
			//alter data on the database
			alterDBStatistics(T_LOGINS,duration,success);
			pushLoginDataToDB("statistics/login_info/"+T_FAILED_LOGINS+"/",duration,mode);
		}
	}


	
}

//wait for google stuff to load
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(start);

/* ================================================*/
/*
 * Changes what is written on the summary page at the end of the series of pages
 * to print out statistics for the password scheme for this client only
 */
function writeSummary(){
	$("#"+TEST_FIELD_ID).hide();
	$("#"+SUMM_FIELD_ID).show();
	$("#user-statistics").html(
		"<ul><li>Your Statistics from Practice Password Sessions:</li>"+
			"<ul><li>Number of Login Attempts: "+userStatistics[P_LOGINS]["total"]+"</li>"+
				"<li>Number of Successful Logins: "+userStatistics[P_LOGINS]["success"]+"</li>"+
				"<li>Average Successful Login Time: "+userStatistics[P_LOGINS]["avgSuccessDuration"]+"</li>"+				
				"<li>Number of Failed Logins: "+userStatistics[P_LOGINS]["fail"]+"</li>"+
				"<li>Average Failed Login Time: "+userStatistics[P_LOGINS]["avgFailDuration"]+"</li></ul>"+
			"<li>Your Statistics from Test Password Sessions:</li>"+
			"<ul><li>Number of Login Attempts: "+userStatistics[T_LOGINS]["total"]+"</li>"+
				"<li>Number of Successful Logins: "+userStatistics[T_LOGINS]["success"]+"</li>"+
				"<li>Average Successful Login Time: "+userStatistics[T_LOGINS]["avgSuccessDuration"]+"</li>"+				
				"<li>Number of Failed Logins: "+userStatistics[T_LOGINS]["fail"]+"</li>"+
				"<li>Average Failed Login Time: "+userStatistics[T_LOGINS]["avgFailDuration"]+"</li></ul>"+
		"</ul>");

}
/* ================================================
 * Grabs sets of all possible words from the database and invokes a function
 * that will create a password.
 */
function createPWDStep(mode){
	var lists = {}; //will contain the necessary details for the password
	
	/* Fetch list of all words used for the software from the database */
	firebase.database().ref(LIST_VALUES_REF).on("value",function(snapshot){
		var listValues = snapshot.val();				
		makePWDStepPart(1,lists,listValues,mode);//create a password: 
	});	
}

/* ================================================*/
/*
 * Shows and hides html elements that are appropriate to be shown/hidden
 * when the user gets their password right while theyre in the practice session
 */
function showSuccessfulTryMsg(fieldID,chartID){
	$("#"+fieldID+" > ."+ SUCCESS_PWD_CLASS).show();
	$("#"+chartID).hide();
	$("#"+fieldID+" > ."+TRY_PWD_CLASS).show();
	$("#"+fieldID+" > ."+"answer-toggle").hide();
	$("#"+fieldID+" > ."+SAVE_PWD_CLASS).show();
}

/* ================================================*/
/*
 * Shows and hides html elements that are appropriate to be shown/hidden
 * when the user gets their password right while theyre in the practice session
 */
function showFailedTryMsg(fieldID,chartID){
	$("#"+fieldID+" > ."+ FAILED_PWD_CLASS).show();
	$("#"+chartID).hide();
	$("#"+fieldID+" > ."+"answer-toggle").hide();
	$("#"+fieldID+" > ."+TRY_PWD_CLASS).show();
}
function hideTryMsg(fieldID,chartID){
	$("#"+fieldID+" > ."+ SUCCESS_PWD_CLASS).hide();
	$("#"+fieldID+" > ."+SAVE_PWD_CLASS).hide();
	$("#"+fieldID+" > ."+TRY_PWD_CLASS).hide();
		$("#"+fieldID+" > ."+"answer-toggle").show();
	$("#"+fieldID+" > ."+ FAILED_PWD_CLASS).hide();
	$("#"+chartID).hide();
}
function retryPractice(fieldID, chartID,list, mode,showAnswer){
	$("#"+fieldID+" > ."+TRY_PWD_CLASS).unbind('click').click(function(){
		addLog("retry_login_requested",p_modeTypeString[mode],list);
		hideTryMsg(fieldID,chartID);
		checkPWDPart(1,list,mode, showAnswer,new Date());
	});	
}
function waitForSaveClick(fieldID,chartID,list,mode,showAnswer){
	$("#"+fieldID+" > ."+SAVE_PWD_CLASS).unbind('click').click(function(){
		addLog("save_login_pwd_requested",p_modeTypeString[mode],list);
		hideTryMsg(fieldID,chartID);
		$("#"+fieldID+" > ."+"answer-toggle").hide();
		savePWD(list, mode);
	});
}
//duration wil be tracked by object duration:{start,end} that will be passed around by the functions
function promptOnSuccessfulTry(list, mode, showAnswer,startTime, endTime){
	addLog("successful_login",p_modeTypeString[mode],list);	
	addLoginData(SUCCESS,(endTime-startTime)/1000,mode,"practice");
	var fieldID = field_id_list[mode];
	var chartID = chart_id_list[mode];
	showSuccessfulTryMsg(fieldID,chartID);
	retryPractice(fieldID,chartID,list,mode,showAnswer);
	waitForSaveClick(fieldID,chartID,list,mode,showAnswer);

}

function promptOnFailedTry(list, mode, showAnswer, startTime, endTime){
	var fieldID;
	var chartID;
	addLoginData(FAILURE,(endTime-startTime)/1000,mode,"practice");
	addLog("failed_login",p_modeTypeString[mode],list);	
	var fieldID = field_id_list[mode];
	var chartID = chart_id_list[mode];
	showFailedTryMsg(fieldID,chartID);
	retryPractice(fieldID,chartID,list,mode,showAnswer);
}



function checkPWDPart(listNum, list, mode, showAnswer,startTime){
	if (listNum==1)	addLog("started_password_attempt",p_modeTypeString[mode],list);	
	var fired = false;
	function selectHandler(chart) {
		var selectedItem = chart.getSelection()[0];
		if (selectedItem && !fired) {			
			fired=true;
			/* Correct choice chosen */
			if (list[listNum]["choice"] == DIRECTIONS[selectedItem.row] ){
				addLog("select_correct_word",p_modeTypeString[mode],list);	
				
				if (listNum < NUM_LIST_PER_PWD) 
					checkPWDPart(++listNum,list, mode, showAnswer,startTime);
				else if (listNum >= NUM_LIST_PER_PWD) 
					promptOnSuccessfulTry(list, mode, showAnswer,startTime,new Date());
			}else  {
				//failed login:
				addLog("selected_wrong_word",p_modeTypeString[mode],list);	
				promptOnFailedTry(list, mode, showAnswer,startTime,new Date());
			}
		}
	}
	//set title, chart id, and mode
	list["title"] = titleList[mode];
	$(".answer-toggle").unbind('click').click(function(){
		showAnswer = !showAnswer;
		console.log("toggle");
		createChart(listNum,list,chart_id_list[mode],showAnswer,selectHandler,mode);
	});
	createChart(listNum,list,chart_id_list[mode],showAnswer,selectHandler,mode);
}


function testPWDPart(listNum,list,mode,showAnswer,numFails,startTime){
	var actionMsg = ""; //differs with modes
	if (listNum==1) addLog("started_password_attempt",t_modeTypeString[mode],list);	
	$("#test-field > h3").html("Testing your "+list["title"]+":");
	$("#"+TESTING_ATTEMPTS_ID).html(numFails);
	var fired = false;
	function selectHandler(chart) {
		var selectedItem = chart.getSelection()[0];
		if (selectedItem && !fired) {

			fired = true;
			if (list[listNum]["choice"] == DIRECTIONS[selectedItem.row] ){
				addLog("select_correct_word",t_modeTypeString[mode],list);	
				chart.clearChart();
				if (listNum<NUM_LIST_PER_PWD) 
					testPWDPart(++listNum,list,mode,showAnswer,numFails,startTime);
				else if (listNum>=NUM_LIST_PER_PWD){
					promptOnSuccessfulTest(list, mode,numFails,startTime,new Date());
				}
			}else {
				//failed login:
				addLog("selected_wrong_word",t_modeTypeString[mode],list);	
				chart.clearChart();
				promptOnFailedTest(list, mode, numFails,startTime,new Date());
			}
		}
	}
	
	createChart(listNum,list,"test_chart_div",showAnswer,selectHandler,mode);
	
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
	firebase.database().ref("userCredentials/"+user_id+"/"+titleList[modeToTest]+"/").on("value",function(snapshot){
		showAnswer=false;
		testPWDPart(1,snapshot.val(),modeToTest,showAnswer,0,new Date());
	});
}

function showSuccessfulTestMsg(numFails){
	
	$("#"+TEST_CHART_ID).hide();
	$("#"+SUCCESS_PWD_TEST_ID).show();
	$("#"+TESTING_ATTEMPTS_ID).html(++numFails);
	$("#"+TEST_PROCEED_PROMPT_ID).show();
	$("#"+SUCCESS_INDV_TEST_ID).show();
	if (numTested>=NUM_MODES) $("#"+TEST_BUTTON_ID).html("Done All Tests");
}
function waitForNextTestClick(list,mode){
	$("#"+TEST_BUTTON_ID).unbind('click').click(function(){
		numTested++;
		$("#"+TEST_PROCEED_PROMPT_ID).hide();
		$("#"+SUCCESS_INDV_TEST_ID).hide();
		$("#"+SUCCESS_PWD_TEST_ID).hide();
		$("#"+FAILED_INDV_TEST_ID).hide();
		$("#"+FAILED_PWD_TEST_ID).hide();
		if (numTested<=NUM_MODES){
			addLog("started_testing_pwd",t_modeTypeString[mode],list);
			nextTest();
		}else {
			addLog("done_testing","testing",list);
			writeSummary();

		}
	});
}
function promptOnSuccessfulTest(list, mode,numFails,startTime, endTime){
	addLog("successful_login",t_modeTypeString[mode],list);	
	addLoginData(SUCCESS,(endTime-startTime)/1000,mode,"test");
	//MAKE SEPARATE LOGIN COLLECTION FOR TEST
	showSuccessfulTestMsg(numFails);
	waitForNextTestClick(list,mode);

}

function showFailedTestMsg(numFails){
	$("#"+TEST_CHART_ID).hide();
	$("#"+FAILED_PWD_TEST_ID).show();	
	
	$("#"+TESTING_ATTEMPTS_ID).html(numFails);
}

function waitForTryAgainClick(list, mode,numFails){
	
	$("#"+TRY_PWD_TEST_ID).show();
	$("#"+TRY_PWD_TEST_ID).click(function(){
		addLog("retry_login_requested",t_modeTypeString[mode],list);
		$("#"+FAILED_PWD_TEST_ID).hide();	
		$("#"+TRY_PWD_TEST_ID).hide();
		testPWDPart(1,list,mode, false,numFails,new Date());
	});
		
}


function promptOnFailedTest(list, mode,numFails,startTime,endTime){
	addLog("failed_login",t_modeTypeString[mode],list);	
	addLoginData(FAILURE,(endTime-startTime)/1000,mode,"test");
	numFails++;
	showFailedTestMsg(numFails);
	
	waitForNextTestClick(list,mode);
	waitForTryAgainClick(list,mode,numFails);
	
	if (numFails>=MAX_LOGIN_FAILURES){
		$("#"+TRY_PWD_TEST_ID).hide();
		addLog("exceeded_max_failed_logins",t_modeTypeString[mode],list);	
		$("#"+TEST_PROCEED_PROMPT_ID).show();
		$("#"+FAILED_INDV_TEST_ID).show();
	}else{
		waitForTryAgainClick(list, mode,numFails);
	}

}
function updateDB(DBpath,data){	firebase.database().ref(DBpath).set(data);}

function savePWD(userWordLists, mode){
	addLog("saved_password",p_modeTypeString[mode],userWordLists);
	updateDB(("userCredentials/"+user_id+"/"+titleList[mode]+"/"),(userWordLists));
	//move on to creating next password, or if theyre all created go to testing
	switch(mode){
		case EMAIL_MODE:
			bankPWD();
			break;
		case BANK_MODE:
			shopPWD();
			break;
		case SHOP_MODE:
			
			testPWDS(userWordLists);
			break;
	}
	//
}

function testPWDS(userWordLists){
	$("#"+SHOP_FIELD_ID).hide();
	addLog("started_testing","testing",userWordLists);
	$("#"+TEST_FIELD_ID).show();
	var modeToTest = Math.floor(Math.random()*NUM_MODES);
	//remove from list of modes left
	delete modes[modeToTest];
	
	addLog("testing_pwd",t_modeTypeString[modeToTest],userWordLists);
	firebase.database().ref("userCredentials/"+user_id+"/"+titleList[modeToTest]+"/").on("value",function(snapshot){	
		numTested++;
		showAnswer=false;
		testPWDPart(1,snapshot.val(),modeToTest,showAnswer,0,new Date());
	});
	//});
}
function makePWDStepPart(listNum,userWordLists,listValues,mode){
	
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
		addLog("generated_pwd",p_modeTypeString[mode],list);		
		/* make user practice it */
		showAnswer=true;
		checkPWDPart(1,userWordLists, mode, showAnswer,new Date());
	}
	/* otherwise, keep making the password */
	else	makePWDStepPart(++listNum, userWordLists, listValues, mode);
	
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
				   tooltip: {trigger: 'none'},
				   slices: sliceStyle};
	
	// Instantiate and draw our chart, passing in some options.
	console.log(divID);
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
	

function applyFuncToDBVal(DBpath, operation){
	firebase.database().ref(DBpath).transaction(function(val){
		return operation(val);
	});
}
function add(val){return ++val;}


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
		applyFuncToDBVal("statistics/userCount/",add);		
		/* log new user arrival*/
		//addLog(new Date(),"recorded_new_user",-1,-1);
		$("#introduction").hide();		
		//invoke email->bank->shop->test
		firebase.database().ref("statistics/login_info/").on("value",function(snapshot){
				var temp = snapshot.val();
				console.log(temp);
				globalStatistics[P_LOGINS]["total"] =temp[P_LOGINS]["total"];
				globalStatistics[P_LOGINS]["success"] =temp[P_LOGINS]["success"];
				globalStatistics[P_LOGINS]["avgSuccessDuration"] =temp[P_LOGINS]["avgSuccessDuration"];
				globalStatistics[P_LOGINS]["fail"] =temp[P_LOGINS]["fail"];
				globalStatistics[P_LOGINS]["avgFailDuration"] =temp[P_LOGINS]["avgFailDuration"];
		});
		emailPWD();		
	});


}


function emailPWD(){
	addLog("requested_pwd",P_EMAIL,-1);
	$("#email-field").show();
	createPWDStep(EMAIL_MODE);
}
function bankPWD(){
	showAnswer=true;
	$("#"+EMAIL_FIELD_ID).hide();
	firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":"requested_bank_pwd"});
	$("#"+BANK_FIELD_ID).show();
	createPWDStep(BANK_MODE);	
	
}
function shopPWD(){
	showAnswer=true;
	$("#"+BANK_FIELD_ID).hide();	
	firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":"requested_shop_pwd"});
	$("#"+SHOP_FIELD_ID).show();
	createPWDStep(SHOP_MODE);	
	
}

