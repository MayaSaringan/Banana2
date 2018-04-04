/* COMP 3008: Project 2 
 *  Names: 
 *  Daniel Sturk(101036873)
 *  Luke Connolly (100999531)
 *	Maya Saringan (101001759)
 * 	Vesh-Yami Diaby (100949894)
 *
 *  Script that implements the password scheme, as well as communicates
 *  with a database to store the password data.
 *  
*/

/* CONSTANTS================ */
/* SCHEME BASIS VALUES */
var DIRECTIONS = ["left","top-left","top","top-right","right","bottom-right","bottom","bottom-left"];
var NUM_DIRECTIONS = 8;
var NUM_LIST_PER_PWD = 7; //7 lists with 8 choices each is equivalent to 2^21 possibilities
var LIST_SIZE = 8; //each direction has a word assigned to it

/* PROJECT REQUIREMENTS VALUES */
var MAX_LOGIN_FAILURES = 3; //when user is entering password during the test session, they can only fail up to 3 times
//3 types of password to generate for user. The variables are used to track which password we r at
var EMAIL_MODE= 0;
var BANK_MODE=1;
var SHOP_MODE=2;


/* HTML IDs & CLASSes -> so we can change the class/id's whenever without having to alter many spots in the script*/
//common to all "pages"
var PWD_INSTRUCTIONS_CLASS = "instructions";
var FAILED_PWD_CLASS ="failed-pwd";
var SUCCESS_PWD_CLASS = "success-pwd";
var TRY_PWD_CLASS = "try-pwd";
var SAVE_PWD_CLASS ="save-pwd";
var CREATE_PWD_CLASS = "create-pwd";
var ANSWER_TOGGLE_CLASS = "answer-toggle";
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
var USER_STATISTICS_ID = "user-statistics";

/* DATABASE PATHS */
var USER_COUNT_REF = "statistics/userCount/";
var LOGIN_INFO_REF = "statistics/login_info/";
var LIST_VALUES_REF = "listValues/";
var LOG_REF = "log/";
var USER_PASSWORD_PATH_REF = "userCredentials/";


/* USER-SPECIFIC */
var user_id = null;	

/* STATISTICS */
//the following are key property values that will be used to identify
//properties in the login statistics client side and in the database
var P_LOGINS = "p_total";               //total logins during practice pwd session
var P_SUCCESSFUL_LOGINS = "p_successes";//total successful logins during practice session
var P_FAILED_LOGINS = "p_fails";        //total failed logins during practice session
var T_LOGINS = "t_total";               //total logins during testing
var T_SUCCESSFUL_LOGINS = "t_successes";//total successful logins during testing
var T_FAILED_LOGINS = "t_fails";        //total failed logins during testing

//contains login statistics for this user:
var userStatistics = {
	"p_total":{                   //for practice pwd sessions
		"total":0,
		"success":0,
		"avgSuccessDuration":0,
		"fail":0,
		"avgFailDuration":0
	},
	"p_successes":[],            //contains time and which pwd for successful login for practice sessions
	"p_fails":[],                //contains time and which pwd for failed login for practice sessions
	
	"t_total":{                   //for test sessions:
		"total":0,
		"success":0,
		"avgSuccessDuration":0,
		"fail":0,
		"avgFailDuration":0
	},
	"t_successes":[],    //contains time and which pwd for successful login for test sessions
	"t_fails":[]        //contains time and which pwd for failed login for test sessions
}
//contains the global statistics for login information
var globalStatistics = {
	"p_total":{             //for practice pwd sessions
		"total":0,
		"success":0,
		"avgSuccessDuration":0,
		"fail":0,
		"avgFailDuration":0
	},
	"p_successes":[],//contains time and which pwd for successful login for practice sessions
	"p_fails":[],    //contains time and which pwd for failed login for practice sessions
	
	"t_total":{      //for test sessions:
		"total":0,
		"success":0,
		"avgSuccessDuration":0,
		"fail":0,
		"avgFailDuration":0
	},
	"t_successes":[],//contains time and which pwd for successful login for test sessions
	"t_fails":[]       //contains time and which pwd for failed login for test sessions
}
/* HELPER VALUES */
var SUCCESS = "success";
var FAILURE="failure";
var ALPHABET_STRING = "abcdefghijklmnopqrstuvwyz";//x is omitted 
var ALPHABET_LENGTH = 25;//26-1 since x is omitted from alphabet string
var NUM_MODES = 3;    //number of password types to generate
var numTested = 0;    //number of passwords tested
//associates a number with a mode
var modes = {0:EMAIL_MODE,1:BANK_MODE,2:SHOP_MODE};
//associates a string title to each mode
var titleList = {0:"Email Password",1:"Bank Password",2:"Shop Password"};
//associates a div id to each mode that contains the chart to show words
var chart_id_list = {0:EMAIL_CHART_ID,1:BANK_CHART_ID,2:SHOP_CHART_ID};
//associates a div id to each mode that contains the entire page for the mode
var field_id_list = {0:EMAIL_FIELD_ID,1:BANK_FIELD_ID,2:SHOP_FIELD_ID};
var showAnswer = true; //when true, the answer shows. Off by default for test sessions
//associates a mode type to each mode, to distinguish between checking for email pwd during practice or during test, etc
var p_modeTypeString = {0:"practice_email",1:"practice_bank",2:"practice_shop"};
var t_modeTypeString = {0:"test_email",1:"test_bank",2:"test_shop"};
//associates a string version of a mode to itself
var modeString = {0:"email",1:"bank",2:"hop"};

/*LOG MESSAGES*/
var REQ_PWD="requested_pwd";
var SUCCESSFUL_LOGIN_MSG = "successful login";
var FAILED_LOGIN_MSG = "failed login";
/* ================================================*/
/* applies a function to a value on the database
 */
function applyFuncToDBVal(DBpath, operation){
	firebase.database().ref(DBpath).transaction(function(val){
		return operation(val);
	});
}
/* ================================================*/
/* operation that increments val
 */
function add(val){return ++val;}



/* ================================================*/
/*
 * Sends a log object to the database, containing the 
 * <eventMsg>,<passwordType>,<pwd>
 */
function addLog(eventMsg, passwordType, pwd){
	var date = new Date();
	//grabs current timestamp and uses it as the key property
	//the value property is the miliseconds to filter through events that happen on the saem second
	//when pushed to the database. When pushed a unique id (not user id) is assigned to each log
		//so that if multiple logs has the exact same timestamp, they are still
		//distinguishable by their unique ids
	if (passwordType==-1 && pwd==-1){
		firebase.database().ref("log/"+date+"/"+date.getMilliseconds()+"/").push({
			"id":user_id,
			"event":eventMsg
		});
	}else if (passwordType!=-1 && pwd==-1){
		firebase.database().ref("log/"+date+"/"+date.getMilliseconds()+"/").push({
			"id":user_id,
			"event":eventMsg,
			"password_type":passwordType,
		});
	}else{
		firebase.database().ref("log/"+date+"/"+date.getMilliseconds()+"/").push({
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
		firebase.database().ref("statistics/login_info/"+section+"/").update(
			{"total":globalStatistics[section]["total"],
			"success":globalStatistics[section]["success"],
			"avgSuccessDuration":globalStatistics[section]["avgSuccessDuration"]
		});	
	}else{
		firebase.database().ref("statistics/login_info/"+section+"/").update(
			{"total":         globalStatistics[section]["total"],
			"fail":           globalStatistics[section]["fail"],
			"avgFailDuration":globalStatistics[section]["avgFailDuration"]
		});			
	}
	//every time the login data is altered client side, alter database login data for this specific user
	firebase.database().ref("userCredentials/"+user_id+"/userStatistics/").set(userStatistics);
	
}
/* ================================================*/
/* Alters statistics client side for relevant sections
 */
 function addToStats(success_section,logins_section, avg_section, status_section, duration,mode){
	//alter statistics variables client side
	userStatistics[success_section].push( 
	{
		"duration":duration,
		"mode":titleList[mode]
	});
	userStatistics[logins_section]["total"]++;		
	userStatistics[logins_section][avg_section] = 
		((userStatistics[logins_section][avg_section]*userStatistics[logins_section][status_section])
		+ duration)/++userStatistics[logins_section][status_section];
	globalStatistics[logins_section]["total"]++;		
	globalStatistics[logins_section][avg_section] = 
		((globalStatistics[logins_section][avg_section]*globalStatistics[logins_section][status_section])
		+ duration)/++globalStatistics[logins_section][status_section];

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
			addToStats(P_SUCCESSFUL_LOGINS,P_LOGINS,"avgSuccessDuration","success",duration,mode);
			//alter data on the database: adds statistics to user and changes global statistics
			alterDBStatistics(P_LOGINS,duration,success);
			pushLoginDataToDB("statistics/login_info/"+P_SUCCESSFUL_LOGINS+"/",duration,mode);
		}else if (success == FAILURE){
			addToStats(P_FAILED_LOGINS,P_LOGINS,"avgFailDuration","fail",duration,mode);
			//alter data on the database
			alterDBStatistics(P_LOGINS,duration,success);
			pushLoginDataToDB("statistics/login_info/"+P_FAILED_LOGINS+"/",duration,mode);
		}

	}else if(sessionType=="test"){
		if (success == SUCCESS){
			addToStats(T_SUCCESSFUL_LOGINS,T_LOGINS,"avgSuccessDuration","success",duration,mode);
			//alter data on the database
			alterDBStatistics(T_LOGINS,duration,success);
			pushLoginDataToDB("statistics/login_info/"+T_SUCCESSFUL_LOGINS+"/",duration,mode);
		}else if (success == FAILURE){
			addToStats(T_FAILED_LOGINS,T_LOGINS,"avgFailDuration","fail",duration,mode);
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
		
	date = new Date();
	firebase.database().ref("userCredentials/"+user_id+"/userstatistics/").push({"time":date,"stats":userStatistics});	

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
	$("#"+fieldID+" > ."+TRY_PWD_CLASS).show();
	$("#"+fieldID+" > ."+ANSWER_TOGGLE_CLASS).hide();
	$("#"+fieldID+" > ."+SAVE_PWD_CLASS).show();
}

/* ================================================*/
/*
 * Shows password entry status messages for failure during practice sessions
 * 
 */
function showFailedTryMsg(fieldID,chartID){
	$("#"+fieldID+" > ."+ FAILED_PWD_CLASS).show();
//	$("#"+chartID).hide();
	$("#"+fieldID+" > ."+ANSWER_TOGGLE_CLASS).hide();
	$("#"+fieldID+" > ."+TRY_PWD_CLASS).show();
}

/* ================================================*/
/*
 * Hides all the password status messages and the ability to keep a password
 * and shows the button to toggle whether the answer shows or not
 */
function hideTryMsg(fieldID,chartID){
	$("#"+fieldID+" > ."+ SUCCESS_PWD_CLASS).hide();
	$("#"+fieldID+" > ."+SAVE_PWD_CLASS).hide();
	$("#"+fieldID+" > ."+TRY_PWD_CLASS).hide();
	$("#"+fieldID+" > ."+ANSWER_TOGGLE_CLASS).show();
	$("#"+fieldID+" > ."+ FAILED_PWD_CLASS).hide();
//	$("#"+chartID).hide();
}

/* ================================================*/
/*
 * Waits for a click on the button to try again. When clicked, 
 * it hides the password status messages & shows the answer toggle
 *  and recreates the chart for the user to click
 */
function retryPractice(fieldID, chartID,list, mode){
	$("#"+fieldID+" > ."+TRY_PWD_CLASS).unbind('click').click(function(){
		addLog("retry_login_requested",p_modeTypeString[mode],list);
		hideTryMsg(fieldID,chartID);
		checkPWDPart(1,list,mode,new Date());
	});	
}
function waitForSaveClick(fieldID,chartID,list,mode){
	$("#"+fieldID+" > ."+SAVE_PWD_CLASS).unbind('click').click(function(){
		addLog("save_login_pwd_requested",p_modeTypeString[mode],list);
		hideTryMsg(fieldID,chartID);
		$("#"+fieldID+" > ."+"answer-toggle").hide();
		savePWD(list, mode);
	});
}
/* ================================================*/
/*
 * When a user gets a whole password entry correct, show the appropriate
 * status messages and wait for them to either retry the password or keep the
 * password and move on
 */
 function promptOnSuccessfulTry(list, mode, startTime, endTime){
	addLog("successful_login",p_modeTypeString[mode],list);	
	addLoginData(SUCCESS,(endTime-startTime)/1000,mode,"practice");
	var fieldID = field_id_list[mode];
	var chartID = chart_id_list[mode];
	showSuccessfulTryMsg(fieldID,chartID);
	retryPractice(fieldID,chartID,list,mode);
	waitForSaveClick(fieldID,chartID,list,mode);

}
/* ================================================*/
/*
 * When a user gets a whole password entry wrong, show the appropriate
 * status messages and wait for them to retry the password. They cannot move on till
 * they get it correct again
 */
function promptOnFailedTry(list, mode, startTime, endTime){
	var fieldID;
	var chartID;
	addLoginData(FAILURE,(endTime-startTime)/1000,mode,"practice");
	addLog("failed_login",p_modeTypeString[mode],list);	
	var fieldID = field_id_list[mode];
	var chartID = chart_id_list[mode];
	showFailedTryMsg(fieldID,chartID);
	retryPractice(fieldID,chartID,list,mode);
}


/* ================================================*/
/*
 * Creates a chart for a single set of words and awaits 
 * for the user to select one of the slices
 */
function checkPWDPart(listNum, list, mode, startTime){
	if (listNum==1)	addLog("started_password_attempt",p_modeTypeString[mode],list);	
	
	var fired = false; //true if a slice has been selected
	function selectHandler(chart) {
		var selectedItem = chart.getSelection()[0]; //gets the selected slice
		if (selectedItem && !fired) {	//if there is a selection		
			fired=true;
			chart.clearChart();
			/* Correct choice chosen */
			if (list[listNum]["choice"] == DIRECTIONS[selectedItem.row] ){
				addLog("select_correct_word",p_modeTypeString[mode],list);	
				
				//if the current set of words is not the last set
				if (listNum < NUM_LIST_PER_PWD)  checkPWDPart(++listNum,list, mode, startTime);
				//if the current set of words is the last set
				else if (listNum >= NUM_LIST_PER_PWD) promptOnSuccessfulTry(list, mode,startTime,new Date());
			}else  {
				/* Bad choice chosen */
				addLog("selected_wrong_word",p_modeTypeString[mode],list);	
				promptOnFailedTry(list, mode,startTime,new Date());
			}
		}
	}
	//give the current list a title if it doesnt already have one
	list["title"] = titleList[mode];
	//bind a click event to the answer toggle button 
	//when clicked the answer will either show or not be hidden/slice is blacked/unblackened
	$("."+ ANSWER_TOGGLE_CLASS).unbind('click').click(function(){
		addLog("toggled_answer_visibility",p_modeTypeString[mode],list);
		showAnswer = !showAnswer;
		//recreate the chart to either show/not show the answer
		createChart(listNum,list,chart_id_list[mode],selectHandler,mode);
	});
	
	//creates a chart at the appropriate section. <showAnswer>'s value determines if answer is shown or not
	//and pass the handler function <selectHandler> to handle the select event on the chart
	createChart(listNum,list,chart_id_list[mode],selectHandler,mode);
}


function testPWDPart(listNum,list,mode,numFails,startTime){
	var actionMsg = ""; //differs with modes
	if (listNum==1) addLog("started_password_attempt",t_modeTypeString[mode],list);	
	$("#test-field > h3").html("Testing your "+list["title"]+":");
	$("#"+TESTING_ATTEMPTS_ID).html(numFails);
	var fired = false;
	function selectHandler(chart) {
		var selectedItem = chart.getSelection()[0];
		if (selectedItem && !fired) {
chart.clearChart();
			fired = true;
			if (list[listNum]["choice"] == DIRECTIONS[selectedItem.row] ){
				addLog("select_correct_word",t_modeTypeString[mode],list);	
				
				if (listNum<NUM_LIST_PER_PWD) 
					testPWDPart(++listNum,list,mode,numFails,startTime);
				else if (listNum>=NUM_LIST_PER_PWD){
					promptOnSuccessfulTest(list, mode,numFails,startTime,new Date());
				}
			}else {
				//failed login:
				addLog("selected_wrong_word",t_modeTypeString[mode],list);	
			//	chart.clearChart();
				promptOnFailedTest(list, mode, numFails,startTime,new Date());
			}
		}
	}
	
	createChart(listNum,list,"test_chart_div",selectHandler,mode);
	
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
		testPWDPart(1,snapshot.val(),modeToTest,0,new Date());
	});
}

function showSuccessfulTestMsg(numFails){
	
//	$("#"+TEST_CHART_ID).hide();
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
				//backup in case database is corrupted with the software bugging up
			 
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
	//$("#"+TEST_CHART_ID).hide();
	$("#"+FAILED_PWD_TEST_ID).show();	
	
	$("#"+TESTING_ATTEMPTS_ID).html(numFails);
}
/* ================================================*/
/* Waits for user to reattempt a password during test mode
 */
function waitForTryAgainClick(list, mode,numFails){
	
	$("#"+TRY_PWD_TEST_ID).show();
	$("#"+TRY_PWD_TEST_ID).unbind("click").click(function(){
		addLog("retry_login_requested",t_modeTypeString[mode],list);
		$("#"+TEST_PROCEED_PROMPT_ID).hide();
		$("#"+FAILED_INDV_TEST_ID).hide();
		$("#"+FAILED_PWD_TEST_ID).hide();	
		$("#"+TRY_PWD_TEST_ID).hide();
		showAnswer=false;
		testPWDPart(1,list,mode,numFails,new Date());
	});
		
}
/* ================================================*/
/* Called when user fails a test password attempt. Remprompts them as 
 * appropriate or goes to test next password
 */
function promptOnFailedTest(list, mode,numFails,startTime,endTime){
	addLog("failed_login",t_modeTypeString[mode],list);	
	addLoginData(FAILURE,(endTime-startTime)/1000,mode,"test");
	numFails++;
	showFailedTestMsg(numFails);
	
	waitForNextTestClick(list,mode);
	waitForTryAgainClick(list,mode,numFails);
	
	if (numFails>=MAX_LOGIN_FAILURES){
		$("#"+TEST_CHART_ID).hide();
		$("#"+FAILED_PWD_TEST_ID).hide();	
		$("#"+TRY_PWD_TEST_ID).hide();
		addLog("exceeded_max_failed_logins",t_modeTypeString[mode],list);	
		$("#"+TEST_PROCEED_PROMPT_ID).show();
		$("#"+FAILED_INDV_TEST_ID).show();
	}else{
		waitForTryAgainClick(list, mode,numFails);
	}

}
function updateDB(DBpath,data){	firebase.database().ref(DBpath).set(data);}
/* ================================================*/
/* Save a password to the database and move on to next password, or to testing,
 * as appropriate
 */
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
/* ================================================*/
/* After the shop password is made, it chooses a random password
 * to test
 */
function testPWDS(userWordLists){
	$("#"+SHOP_FIELD_ID).hide();
	addLog("started_testing","testing",userWordLists);
	$("#"+TEST_FIELD_ID).show();
	//pick a random password to test
	var modeToTest = Math.floor(Math.random()*NUM_MODES);
	//remove from list of modes left
	delete modes[modeToTest];
	
	
	firebase.database().ref("userCredentials/"+user_id+"/"+titleList[modeToTest]+"/").on("value",function(snapshot){	
		numTested++;
		showAnswer=false;
		testPWDPart(1,snapshot.val(),modeToTest,0,new Date());
	});
}

/* ================================================*/
/* Creates a single set of words for the password
 * But calls itself after to make the next set, so it in effect creates the whole password
 * Calls a function that starts having the user practice the password after it is made
 */
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
		checkPWDPart(1,userWordLists, mode, new Date());
	}
	/* otherwise, keep making the password */
	else	makePWDStepPart(++listNum, userWordLists, listValues, mode);
	
}
/* ================================================*/
/* Creates a chart displaying the set of words and attaches a listener
 * to wait for a slice to be selected
 */
function createChart(listNum,list,divID,handlerFunc,mode){
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
		[list[listNum]["list"]["bottom-left"], 1]
	]);
	var sliceStyle={};
	if (showAnswer){
		var actualChoice = list[listNum]["choice"];
		console.log("actual choice:"+list[listNum]["choice"]);
		//try to find outerHTML what slice it is wordiwse
		if (actualChoice =="left") sliceStyle ={ 0:{textStyle:{color:'black'}}};
		else if (actualChoice =="top-left")  sliceStyle ={ 1:{textStyle:{color:'black'}}};
		else if (actualChoice =="top") sliceStyle ={ 2:{textStyle:{color:'black'}}};
		else if (actualChoice =="top-right")  sliceStyle ={ 3:{textStyle:{color:'black'}}};
		else if (actualChoice =="right") sliceStyle ={ 4:{textStyle:{color:'black'}}};
		else if (actualChoice =="bottom-right") sliceStyle ={ 5:{textStyle:{color:'black'}}};
		else if (actualChoice =="bottom") sliceStyle ={ 6:{textStyle:{color:'black'}}};
		else if (actualChoice =="bottom-left") sliceStyle ={ 7:{textStyle:{color:'black'}}};
	}
	
	// Set chart options
	var options = {title:list["title"],
				   width:600,
				   height:500,
				   pieSliceText: 'label',
				   "pieSliceTextStyle":{"fontSize":"20"},
				   legend: 'none',
				   pieStartAngle: -115,
				   tooltip: {trigger: 'none'},
				   slices: sliceStyle};
	
	// Instantiate and draw our chart, passing in some options.
	console.log(divID);
	var chart = new google.visualization.PieChart(document.getElementById(divID));
	
	google.visualization.events.addOneTimeListener(chart, 'select', function () {
						handlerFunc(chart);
						});    
	//37 left  |   38 up  |   39 right   |   40 down
	//65 a     |   87 w   |   68   d     |   83 s
	var fired =false;
	var arrowKeys = {37:false, 38:false, 39:false, 40:false,
					65: false, 87: false, 68: false, 83: false};
					
					
	/* Returns true if another element in arrowKeys other than <a> 
	 * and <b> is true (they are true if pressed)
	 */
	function areOtherValsTrue(a,b){
		for(var key in arrowKeys) {
			if(arrowKeys[key] && key != a && key!=b) {
				return true;
			}
		}
		return false;
	}
	$("html").keydown(function(e) {
		if (e.keyCode in arrowKeys && !fired ) {
			
			arrowKeys[e.keyCode] = true;
			e.preventDefault();
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
			
			if ((arrowKeys[37] || arrowKeys[65]) && !areOtherValsTrue(37,65)){
				$("#log").html("left pressed");
				chart.setSelection([{row: 0}]);fired=true;
				 handlerFunc(chart);
				 
			}
			//check if up only pressed
			else if ((arrowKeys[38] || arrowKeys[87])&& !areOtherValsTrue(38,87)){
				$("#log").html("up pressed");
				chart.setSelection([{row: 2}]); fired=true
				 handlerFunc(chart);
				;
			}
			//check if right only pressed
			else if ((arrowKeys[39] || arrowKeys[68])&& !areOtherValsTrue(39,68)){
				$("#log").html("right pressed");
				chart.setSelection([{row: 4}]); fired=true;
				 handlerFunc(chart);
				
			}
			//check if down only pressed
			else if ((arrowKeys[40] || arrowKeys[83])&& !areOtherValsTrue(40,83)){
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
	



/* ================================================*/
/* Starts up the password process
 */
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
	//alternative database link for later testing
	 var config2 = {
		apiKey: "AIzaSyA2I6dTZ1ZEXi0LiR_o2CApgSEnRcKW0HI",
		authDomain: "comp-3008v2.firebaseapp.com",
		databaseURL: "https://comp-3008v2.firebaseio.com",
		projectId: "comp-3008v2",
		storageBucket: "comp-3008v2.appspot.com",
		messagingSenderId: "483115186465"
	};
	firebase.initializeApp(config2);//config one for actual testing - config2 for debugging
	
	/* activity starts being logged whenever the user clicks this button */
	$("#start-process").unbind("click").click(function(){
		
		/* GENERATE USER ID -- assign default value -1*/
		user_id = firebase.database().ref("userCredentials/").push(-1).key;		
		/* update user count stat */
		applyFuncToDBVal("statistics/userCount/",add);		
		/* log new user arrival*/
		addLog("recorded_new_user",-1,-1);
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

/* ================================================*/
/* Starts the generation of an email password
 */
function emailPWD(){
	showAnswer=true;
	addLog("requested_pwd",p_modeTypeString[EMAIL_MODE],-1);
	$("#email-field").show();
	createPWDStep(EMAIL_MODE);
}

/* ================================================*/
/* Starts the generation of a bank password
 */
function bankPWD(){
	showAnswer=true;
	$("#"+EMAIL_FIELD_ID).hide();
	addLog("requested_pwd",p_modeTypeString[BANK_MODE],-1);
	$("#"+BANK_FIELD_ID).show();
	createPWDStep(BANK_MODE);	
	
}


/* ================================================*/
/* Starts the generation of a shop password
 */
function shopPWD(){
	showAnswer=true;
	$("#"+BANK_FIELD_ID).hide();	
	addLog("requested_pwd",p_modeTypeString[SHOP_MODE],-1);
	$("#"+SHOP_FIELD_ID).show();
	createPWDStep(SHOP_MODE);	
	
}

