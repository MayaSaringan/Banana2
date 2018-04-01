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
 *  Updated: April 1, 2018
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
//var gen_numAttempts = {0:0,1:0,2:0};
var practice_numSuccesses = {0:0,1:0,2:0};
var practice_numFailures  = {0:0,1:0,2:0};
var practice_numRetries  ={0:0,1:0,2:0};
var practice_numLogins  ={0:0,1:0,2:0};
//test
var test_numSuccesses = {0:0,1:0,2:0};
var test_numFailures  = {0:0,1:0,2:0};
var test_numRetries   = {0:0,1:0,2:0};
var test_numLogins    = {0:0,1:0,2:0};

var I_practice_numSuccesses = {0:0,1:0,2:0};
var I_practice_numFailures  ={0:0,1:0,2:0};
var I_practice_numRetries  = {0:0,1:0,2:0};
var I_practice_numLogins  = {0:0,1:0,2:0};
//test
var I_test_numSuccesses = {0:0,1:0,2:0};
var I_test_numFailures  = {0:0,1:0,2:0};
var I_test_numRetries   = {0:0,1:0,2:0};
var I_test_numLogins    = {0:0,1:0,2:0};



/* HELPER VALUES */
var ALPHABET_STRING = "abcdefghijklmnopqrstuvwxyz";
var ALPHABET_LENGTH = 9;//26;
var NUM_MODES = 3;
var numTested = 0;
var modes = {0:EMAIL_MODE,1:BANK_MODE,2:SHOP_MODE};

//wait for google stuff to load
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(start);
function writeSummary(){
	$("#userCount").html(userCount);
	$("#I_practice_numLogins").html(
		"\nEmail: "+I_practice_numLogins[EMAIL_MODE]+
		" Bank: "+I_practice_numLogins[BANK_MODE]+
		" Shop: "+I_practice_numLogins[EMAIL_MODE]+".");
	$("#I_practice_numSuccesses").html(
		"\nEmail: "+I_practice_numSuccesses[EMAIL_MODE]+
		" Bank: "+I_practice_numSuccesses[BANK_MODE]+
		" Shop: "+I_practice_numSuccesses[SHOP_MODE]+".");
	$("#I_practice_numFailures").html(
		"\nEmail: "+I_practice_numFailures[EMAIL_MODE]+
		" Bank: "+I_practice_numFailures[BANK_MODE]+
		" Shop: "+I_practice_numFailures[SHOP_MODE]+".");
	$("#I_practice_numRetries").html(
		"\nEmail: "+I_practice_numRetries[EMAIL_MODE]+
		" Bank: "+I_practice_numRetries[BANK_MODE]+
		" Shop: "+I_practice_numRetries[SHOP_MODE]+".");
	$("#I_test_numLogins").html(
		"\nEmail: "+I_test_numLogins[EMAIL_MODE]+
		" Bank: "+I_test_numLogins[BANK_MODE]+
		" Shop: "+I_test_numLogins[EMAIL_MODE]+".");
	$("#I_test_numSuccesses").html(
		"\nEmail: "+I_test_numSuccesses[EMAIL_MODE]+
		" Bank: "+I_test_numSuccesses[BANK_MODE]+
		" Shop: "+I_test_numSuccesses[SHOP_MODE]+".");
	$("#I_test_numFailures").html(
		"\nEmail: "+I_test_numFailures[EMAIL_MODE]+
		" Bank: "+I_test_numFailures[BANK_MODE]+
		" Shop: "+I_test_numFailures[SHOP_MODE]+".");
	$("#I_test_numRetries").html(
		"\nEmail: "+I_test_numRetries[EMAIL_MODE]+
		" Bank: "+I_test_numRetries[BANK_MODE]+
		" Shop: "+I_test_numRetries[SHOP_MODE]+".");
		
	$("#G_practice_numLogins").html(
		"\nEmail: "+practice_numLogins[EMAIL_MODE]+
		" Bank: "+practice_numLogins[BANK_MODE]+
		" Shop: "+practice_numLogins[EMAIL_MODE]+".");
	$("#G_practice_numSuccesses").html(
		"\nEmail: "+practice_numSuccesses[EMAIL_MODE]+
		" Bank: "+practice_numSuccesses[BANK_MODE]+
		" Shop: "+practice_numSuccesses[SHOP_MODE]+".");
	$("#G_practice_numFailures").html(
		"\nEmail: "+practice_numFailures[EMAIL_MODE]+
		" Bank: "+practice_numFailures[BANK_MODE]+
		" Shop: "+practice_numFailures[SHOP_MODE]+".");
	$("#G_practice_numRetries").html(
		"\nEmail: "+practice_numRetries[EMAIL_MODE]+
		" Bank: "+practice_numRetries[BANK_MODE]+
		" Shop: "+practice_numRetries[SHOP_MODE]+".");
	$("#G_test_numLogins").html(
		"\nEmail: "+test_numLogins[EMAIL_MODE]+
		" Bank: "+test_numLogins[BANK_MODE]+
		" Shop: "+test_numLogins[EMAIL_MODE]+".");
	$("#G_test_numSuccesses").html(
		"\nEmail: "+test_numSuccesses[EMAIL_MODE]+
		" Bank: "+test_numSuccesses[BANK_MODE]+
		" Shop: "+test_numSuccesses[SHOP_MODE]+".");
	$("#G_test_numFailures").html(
		"\nEmail: "+test_numFailures[EMAIL_MODE]+
		" Bank: "+test_numFailures[BANK_MODE]+
		" Shop: "+test_numFailures[SHOP_MODE]+".");
	$("#G_test_numRetries").html(
		"\nEmail: "+test_numRetries[EMAIL_MODE]+
		" Bank: "+test_numRetries[BANK_MODE]+
		" Shop: "+test_numRetries[SHOP_MODE]+".");
}
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
		var actionMsg="";
	switch (mode){
		case EMAIL_MODE: actionMsg ="practice_email_successful_login";break;
		case BANK_MODE: actionMsg = "practice_bank_successful_login";break;
		case SHOP_MODE: actionMsg = "practice_shop_successful_login";break;
	}
	firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":actionMsg,"pwd":list});
	console.log(log);
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
		practice_numRetries[mode]++;
		I_practice_numRetries[mode]++;
		firebase.database().ref("statistics/").update({"practice_numRetries":practice_numRetries});
		
		switch (mode){
			case EMAIL_MODE: actionMsg ="practice_email_requested_retry";break;
			case BANK_MODE: actionMsg = "practice_email_requested_retry";break;
			case SHOP_MODE: actionMsg = "practice_email_requested_retry";break;
		}
		firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":actionMsg,"pwd":list});
		console.log(log);
		$("#"+fieldID+" > ."+ SUCCESS_PWD_CLASS).hide();
			$("#"+fieldID+" > ."+SAVE_PWD_CLASS).hide();
		$("#"+fieldID+" > ."+TRY_PWD_CLASS).hide();
		checkPWDPart(1,list,mode, showAnswer);
	});
	$("#"+fieldID+" > ."+SAVE_PWD_CLASS).show();
	$("#"+fieldID+" > ."+SAVE_PWD_CLASS).unbind('click').click(function(){
		
		switch (mode){
			case EMAIL_MODE: actionMsg ="practice_email_requested_save";break;
			case BANK_MODE: actionMsg = "practice_email_requested_save";break;
			case SHOP_MODE: actionMsg = "practice_email_requested_save";break;
		}
		firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":actionMsg,"pwd":list});
		console.log(log);
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
	var actionMsg="";
	switch (mode){
		case EMAIL_MODE: actionMsg ="practice_email_failed_login";break;
		case BANK_MODE: actionMsg = "practice_bank_failed_login";break;
		case SHOP_MODE: actionMsg = "practice_shop_failed_login";break;
	}
	firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":actionMsg,"pwd":list});
	console.log(log);
	$("#"+fieldID+" > ."+ FAILED_PWD_CLASS).show();
	$("#"+chartID).hide();
	$("#"+fieldID+" > ."+TRY_PWD_CLASS).show();
	$("#"+fieldID+" > ."+TRY_PWD_CLASS).unbind('click').click(function(){
		practice_numRetries[mode]++;
		I_practice_numRetries[mode]++;
		firebase.database().ref("statistics/").update({"practice_numRetries":practice_numRetries});
		switch (mode){
			case EMAIL_MODE: actionMsg ="practice_email_requested_retry";break;
			case BANK_MODE: actionMsg = "practice_email_requested_retry";break;
			case SHOP_MODE: actionMsg = "practice_email_requested_retry";break;
		}
		firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":actionMsg,"pwd":list});
		console.log(log);
		$("#"+fieldID+" > ."+ FAILED_PWD_CLASS).hide();
		$("#"+fieldID+" > ."+TRY_PWD_CLASS).hide();
			checkPWDPart(1,list,mode, showAnswer);
	});
}



function checkPWDPart(listNum, list, mode, showAnswer){
	var actionMsg = ""; //differs with modes
	if (listNum==1){
		switch (mode){
			case EMAIL_MODE: actionMsg ="practice_email_start_attempt";break;
			case BANK_MODE: actionMsg = "practice_bank_start_attempt";break;
			case SHOP_MODE: actionMsg = "practice_shop_start_attempt";break;
		}
		firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":actionMsg,"pwd":list});
	}
	var fired = false;
	function selectHandler(chart) {
		var selectedItem = chart.getSelection()[0];
		if (selectedItem && !fired) {
			
			fired=true;
			/* Correct choice chosen */
			if (list[listNum]["choice"] == DIRECTIONS[selectedItem.row] ){
				practice_numSuccesses[mode]++;
				I_practice_numSuccesses[mode]++;
				firebase.database().ref("statistics/").update({"practice_numSuccesses":practice_numSuccesses});
				switch (mode){
					case EMAIL_MODE: actionMsg ="practice_email_selected_correct_word";break;
					case BANK_MODE: actionMsg = "practice_bank_selected_correct_word";break;
					case SHOP_MODE: actionMsg = "practice_shop_selected_correct_word";break;
				}
				firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":actionMsg,"pwd":list});
				
				if (listNum < NUM_LIST_PER_PWD) checkPWDPart(++listNum,list, mode, showAnswer);
				else if (listNum >= NUM_LIST_PER_PWD) {
					practice_numLogins[mode]++;
					I_practice_numLogins[mode]++;
					firebase.database().ref("statistics/").update({"practice_numLogins":practice_numLogins});
					promptOnSuccessfulTry(list, mode, showAnswer);
				}
			}else  {
				practice_numFailures[mode]++;
				I_practice_numFailures[mode]++;
				firebase.database().ref("statistics/").update({"practice_numFailures":practice_numFailures});
				switch (mode){
					case EMAIL_MODE: actionMsg ="practice_email_selected_wrong_word";break;
					case BANK_MODE: actionMsg = "practice_bank_selected_wrong_word";break;
					case SHOP_MODE: actionMsg = "practice_shop_selected_wrong_word";break;
				}
				firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":actionMsg,"pwd":list});
				console.log(log);
				promptOnFailedTry(list, mode, showAnswer);
			}
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
					var actionMsg = ""; //differs with modes
		if (listNum==1){
		switch (mode){
			case EMAIL_MODE: actionMsg ="test_email_start_attempt";break;
			case BANK_MODE: actionMsg = "test_bank_start_attempt";break;
			case SHOP_MODE: actionMsg = "test_shop_start_attempt";break;
		}
		firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":actionMsg,"pwd":list});
	}
	
	$("#test-field > h3").html("Testing your "+list["title"]+":");
	$("#"+TESTING_ATTEMPTS_ID).html(numFails);
	var fired = false;
	function selectHandler(chart) {
		var selectedItem = chart.getSelection()[0];
		if (selectedItem && !fired) {

			fired = true;
			if (list[listNum]["choice"] == DIRECTIONS[selectedItem.row] ){
					test_numSuccesses[mode]++;
					I_test_numSuccesses[mode]++;
				firebase.database().ref("statistics/").update({"test_numSuccesses":test_numSuccesses});
			
				switch (mode){
					case EMAIL_MODE: actionMsg ="test_email_selected_correct_word";break;
					case BANK_MODE: actionMsg = "test_bank_selected_correct_word";break;
					case SHOP_MODE: actionMsg = "test_shop_selected_correct_word";break;
				}
				//log[new Date()] = {"id":user_id,"action":actionMsg,"pwd":list};
				firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":actionMsg,"pwd":list});console.log(log);
				chart.clearChart();
				if (listNum<NUM_LIST_PER_PWD) testPWDPart(++listNum,list,mode,showAnswer,numFails);
				else if (listNum>=NUM_LIST_PER_PWD){
					test_numLogins[mode]++;
					I_test_numLogins[mode]++;
					firebase.database().ref("statistics/").update({"test_numLogins":test_numLogins});promptOnSuccessfulTest(list, mode,numFails);
				}
			}else {
				I_test_numFailures[mode]++;
				test_numFailures[mode]++;
				firebase.database().ref("statistics/").update({"test_numFailures":test_numFailures});
				switch (mode){
					case EMAIL_MODE: actionMsg ="test_email_selected_wrong_word";break;
					case BANK_MODE: actionMsg = "test_bank_selected_wrong_word";break;
					case SHOP_MODE: actionMsg = "test_shop_selected_wrong_word";break;
				}
				//log[new Date()] = {"id":user_id,"action":actionMsg,"pwd":list};
				firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":actionMsg,"pwd":list});
				chart.clearChart();promptOnFailedTest(list, mode,numFails)
			}
			console.log(list);
		}
	}
	
	createChart(listNum,list,"test_chart_div",showAnswer,selectHandler,mode);
	
}

function promptOnSuccessfulTest(list, mode,numFails){
		var actionMsg = ""; //differs with modes
	switch (mode){
		case EMAIL_MODE: actionMsg ="test_email_successful_login";break;
		case BANK_MODE: actionMsg = "test_bank_successful_login";break;
		case SHOP_MODE: actionMsg = "test_shop_successful_login";break;
	}
	//log[new Date()] = {"id":user_id,"action":actionMsg,"pwd":list};
	firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":actionMsg,"pwd":list});//console.log(log);
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
			switch (mode){
				case EMAIL_MODE: actionMsg ="started_testing_email";break;
				case BANK_MODE: actionMsg ="started_testing_bank";break;
				case SHOP_MODE: actionMsg = "started_testing_shop";break;
			}
			firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":actionMsg,"pwd":list});//log[new Date()] = {"id":user_id,"action":actionMsg,"pwd":list};
			//console.log(log);
			nextTest();
		}else {
			firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":"done_testing","pwd":list});//log[new Date()] = {"id":user_id,"action":"done_testing","pwd":list};
			//console.log(log);

			writeSummary();
			$("#"+TEST_FIELD_ID).hide();
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
			var actionMsg = ""; //differs with modes
	switch (mode){
		case EMAIL_MODE: actionMsg ="test_email_failed_login";break;
		case BANK_MODE: actionMsg = "test_bank_failed_login";break;
		case SHOP_MODE: actionMsg = "test_shop_failed_login";break;
	}
	firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":actionMsg,"pwd":list});//log[new Date()] = {"id":user_id,"action":actionMsg,"pwd":list};
	//console.log(log);
	$("#"+TEST_CHART_ID).hide();
	$("#"+FAILED_PWD_TEST_ID).show();	
	numFails++;$("#"+TESTING_ATTEMPTS_ID).html(numFails);
	//see how many times there has been a failure
	console.log ("numfails : "+numFails);
	if (numFails>=MAX_LOGIN_FAILURES){$("#"+TRY_PWD_TEST_ID).hide();
		switch (mode){
			case EMAIL_MODE: actionMsg ="test_email_exceeded_max_failed_logins";break;
			case BANK_MODE: actionMsg ="test_bank_exceeded_max_failed_logins";break;
			case SHOP_MODE:actionMsg ="test_shop_exceeded_max_failed_logins";break;
		}
		firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":actionMsg,"pwd":list});//log[new Date()] = {"id":user_id,"action":actionMsg,"pwd":list};
		//console.log(log);
		$("#"+TEST_PROCEED_PROMPT_ID).show();
		$("#"+FAILED_INDV_TEST_ID).show();
		$("#"+TEST_BUTTON_ID).unbind('click').click(function(evt){
			evt.stopPropagation();
			firebase.database().ref("statistics/").update({"test_numRetries":I_test_numRetries});
			$("#"+TEST_PROCEED_PROMPT_ID).hide();
			$("#"+FAILED_INDV_TEST_ID).hide();
			$("#"+FAILED_PWD_TEST_ID).hide();
numTested++;
			console.log("numTested: "+numTested);
			if (numTested<=NUM_MODES){
							switch (mode){
				case EMAIL_MODE: actionMsg ="started_testing_email";break;
				case BANK_MODE: actionMsg ="started_testing_bank";break;
				case SHOP_MODE: actionMsg = "started_testing_shop";break;
			}
			firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":actionMsg,"pwd":list});//log[new Date()] = {"id":user_id,"action":actionMsg,"pwd":list};
			//console.log(log);
				
				nextTest();
			}else {
				firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":"done_testing","pwd":list});//log[new Date()] = {"id":user_id,"action":"done_testing","pwd":list};
			
			$("#"+TEST_FIELD_ID).hide();
						$("#"+SUMM_FIELD_ID).show();writeSummary();
			//	console.log("i wanna hide everything");
			}
			
			
		});
	}else{
		$("#"+TRY_PWD_TEST_ID).show();
		$("#"+TRY_PWD_TEST_ID).click(function(evt){
				test_numRetries[mode]++;I_test_numRetries[mode]++;
			firebase.database().ref("statistics/").update({"test_numRetries":test_numRetries});
		
			switch (mode){
			case EMAIL_MODE: actionMsg ="test_email_requested_retry";break;
			case BANK_MODE: actionMsg = "test_email_requested_retry";break;
			case SHOP_MODE: actionMsg = "test_email_requested_retry";break;
		}
		firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":actionMsg,"pwd":list});//log[new Date()] = {"id":user_id,"action":actionMsg,"pwd":list};
	//	console.log(log);
			evt.stopPropagation();
			$("#"+FAILED_PWD_TEST_ID).hide();	
			$("#"+TRY_PWD_TEST_ID).hide();
				testPWDPart(1,list,mode, false,numFails);
		});
		
	}

}
function savePWD(userWordLists, mode){
		
		var actionMsg="";
	switch(mode){
		case EMAIL_MODE: 
			
			firebase.database().ref("userCredentials/"+user_id+"/").update({"email-pwd":userWordLists});
			actionMsg ="saved_email_password";
			$("#"+EMAIL_FIELD_ID).hide();break;
		case BANK_MODE: 
			
			firebase.database().ref("userCredentials/"+user_id+"/").update({"bank-pwd":userWordLists});
			actionMsg ="saved_bank_password";
			$("#"+BANK_FIELD_ID).hide();break;
		case SHOP_MODE: 
			firebase.database().ref("userCredentials/"+user_id+"/").update({"shop-pwd":userWordLists});
			actionMsg ="saved_shop_password";
			$("#"+SHOP_FIELD_ID).hide();break;
	}
	firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":actionMsg,"pwd":userWordLists});//log[new Date()] = {"id":user_id,"action":actionMsg,"pwd":userWordLists};
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
			testPWDS(userWordLists);
			break;
	}
	//
}

function testPWDS(userWordLists){
	firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":"started_testing","pwd":userWordLists});//	log[new Date()] = {"id":user_id,"action":"started_password_testing","pwd":userWordLists};
	$("#"+TEST_FIELD_ID).show();
	var modeToTest = Math.floor(Math.random()*NUM_MODES);
		//remove from list of modes left
	delete modes[modeToTest];
	var pwdPath = "";
	var actionMsg="";
	switch(modeToTest){
		case EMAIL_MODE:pwdPath = "email-pwd/";actionMsg = "start_testing_email";break;
		case BANK_MODE:pwdPath = "bank-pwd/";actionMsg = "start_testing_bank";break;
		case SHOP_MODE:pwdPath = "shop-pwd/";actionMsg = "start_testing_shop";break;
	}
	firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":actionMsg,"pwd":userWordLists});//log[new Date()] = {"id":user_id,"action":actionMsg,"pwd":userWordLists};
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
		firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":actionMsg,"pwd":list});//log[new Date()] = {"id":user_id,"action":actionMsg,"pwd":userWordLists};
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
				   tooltip: {trigger: 'none'},
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
		firebase.database().ref("statistics/userCount/").transaction(function(id){
			userCount = id + 1;
			return ++id;
		});
		firebase.database().ref("statistics/practice_numLogins/").on("value",function(e){
			//console.log("numlogins is " + e);
			//console.log(e.val());
			practice_numLogins = e.val();
		});
		firebase.database().ref("statistics/practice_numSuccesses/").on("value",function(e){
			practice_numSuccesses = e.val();
			//console.
		});
		firebase.database().ref("statistics/practice_numFailures/").on("value",function(e){
			practice_numFailures = e.val();
		});
		firebase.database().ref("statistics/practice_numRetries/").on("value",function(e){
			practice_numRetries = e.val();
		});
		
		firebase.database().ref("statistics/test_numLogins/").on("value",function(e){
			test_numLogins = e.val();
		});
		firebase.database().ref("statistics/test_numSuccesses/").on("value",function(e){
			test_numSuccesses = e.val();
		});
		firebase.database().ref("statistics/test_numFailures/").on("value",function(e){
			test_numFailures = e.val();
		});
		firebase.database().ref("statistics/test_numRetries/").on("value",function(e){
			test_numRetries = e.val();
		});
		firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":"recorded_new_user"});
		$("#introduction").hide();		
		startPWDs();		
	});
	//var j = {0:"jar",1:"jump",2:"jig",3:"jolly",4:"jail",5:"jade",6:"jest",7:"jam",8:"job","count":9};
	//firebase.database().ref("listValues/j/").set(j);
//	firebase.database().ref("listValues/a/").set({0:"aim",1:"apple",2:"axe",3:"art",4:"ammo",5:"annoy",6:"avail",7:"army",8:"amulet","count":9});
//	firebase.database().ref("listValues/b/").set({0:"bad",1:"boom",2:"bell",3:"brain",4:"bride",5:"box",6:"buff",7:"brawn",8:"bill","count":9});
	//firebase.database().ref("listValues/c/").set({0:"car",1:"cool",2:"clam",3:"cradle",4:"coot",5:"clutch",6:"cease",7:"crew",8:"camel","count":9});
//	firebase.database().ref("listValues/d/").set({0:"drama",1:"drop",2:"dry",3:"dirt",4:"dawn",5:"dress",6:"dice",7:"dentist",8:"doctor","count":9});
//	firebase.database().ref("listValues/e/").set({0:"ever",1:"err",2:"ease",3:"excite",4:"effort",5:"ember",6:"edit",7:"end",8:"ew","count":9});
//	firebase.database().ref("listValues/f/").set({0:"fox",1:"fun",2:"fido",3:"first",4:"fort",5:"fern",6:"friend",7:"flush",8:"fish","count":9});
	//firebase.database().ref("listValues/g/").set({0:"gross",1:"gloom",2:"game",3:"guard",4:"glory",5:"gust",6:"grain",7:"guess",8:"grill","count":9});
//	firebase.database().ref("listValues/h/").set({0:"hot",1:"hum",2:"hue",3:"herd",4:"hex",5:"hash",6:"heal",7:"heart",8:"help","count":9});
//	firebase.database().ref("listValues/i/").set({0:"ill",1:"ip",2:"iffy",3:"image",4:"int",5:"illegal",6:"isolate",7:"isle",8:"item","count":9});
//firebase.database().ref("listValues/j/").set(j);

}

function startPWDs(){
	/* log a user starting the password process -> start with email*/
	firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":"requested_email_pwd"});
	$("#"+EMAIL_FIELD_ID).show();
	createPWDChain(EMAIL_MODE);
}
function bankPWD(){

	firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":"requested_bank_pwd"});
	$("#"+BANK_FIELD_ID).show();
	createPWDChain(BANK_MODE);	
	
}
function shopPWD(){

	firebase.database().ref("log/"+new Date()+"/").set({"id":user_id,"action":"requested_shop_pwd"});
	$("#"+SHOP_FIELD_ID).show();
	createPWDChain(SHOP_MODE);	
	
}

