const Web3 = require("web3");

let web3fornitore = new Web3('http://localhost:22000');
let web3produttore = new Web3('http://localhost:22001');
let web3consumatore = new Web3('http://localhost:22002');
let myAbiAndBytecode = require("./contract.js");

web3fornitore.eth.handleRevert = true;
web3produttore.eth.handleRevert = true;
web3consumatore.eth.handleRevert = true;

fs = require('fs');
var crypto = require('crypto');
var validator = require('validator');

let fornitore = null;
let produttore = null;
let consumatore = null;
var contractAddress = null;
var abi = myAbiAndBytecode.abi;
var bytecode= myAbiAndBytecode.bytecode;

const readline = require('readline');

const { resourceLimits } = require("worker_threads");
const { resolve } = require("dns");
	const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
	});

var counter =0;
init();


function init() {
	web3fornitore.eth.getAccounts().then((value)=> {
		fornitore = value[0];	
		});
	web3produttore.eth.getAccounts().then((value)=> {
		produttore = value[0];		
		});
	web3consumatore.eth.getAccounts().then((value)=> {
		consumatore = value[0];
		if (fornitore != null && produttore !=null){

			try {
				const data = fs.readFileSync('contractaddress.txt', 'utf8');
				try{
					const hash = fs.readFileSync('contractaddresshash.txt', 'utf8');
					var addressHash = crypto.createHash('md5').update(data).digest("hex");
					if (addressHash == hash){
						contractAddress = data;
						login();
					} else throw err; 	
				} catch (err){
					console.log('\x1b[31m%s\x1b[0m',"Attenzione: il sistema è stato manomesso. Verrà generato un nuovo indirizzo per lo smart contract");
					deploy();
				}				
			} catch (err) {
				console.log('\x1b[36m%s\x1b[0m',"Non è stato trovato nessun indirizzo per lo smart contract. Verrà effettuata una deploy.");
				deploy();
			}
			
			//login();
		} else if (counter<3){
			console.log("Inizializzazione...");
			counter++;
			init();
		}
		else { 
			console.log('\x1b[31m%s\x1b[0m',"Inizializzazione fallita");
		}
	});				
}


function demoFornitore() {
	if (fornitore == null){
		console.log('\x1b[31m%s\x1b[0m',"Login non riuscito");
		login();
	} else {
		console.log('\x1b[36m%s\x1b[0m',"\nBenvenuto Fornitore!");
		rl.question("Cosa vuoi fare?\n1 - Bilancio \n2 - Inserimento di una materia prima\n3 - Ricerca di una materia prima posseduta in base al nome\n0 - Logout\n", function(scelta) {
		
			let contract = new web3fornitore.eth.Contract(abi, contractAddress);
			
			switch (scelta){
				case '1':
				case 'Bilancio':	
				case 'bilancio':
					balanceMateriePrime(contract,fornitore,"Bilancio"); 
					break;
				case '2':
				case 'Inserimento di una materia prima':
				case 'inserimento di una materia prima':
					inserimentoMat();
					break;
				case '3':
				case 'Ricerca di una materia prima posseduta in base al nome':
				case 'ricerca di una materia prima posseduta in base al nome':
					ricercaMatPossedute(contract,fornitore);
					break;
				case '0':
				case 'Logout':
				case 'logout':
					login();
					break;			
				default:
					console.log('\x1b[31m%s\x1b[0m',"L'opzione scelta non è valida");
					demoFornitore();
					break;
				}	
		})
	}
}

function demoProduttore() {
	if (produttore == null){
		console.log("Login non riuscito");
		login();
	} else {
		console.log('\x1b[36m%s\x1b[0m',"\nBenvenuto Produttore!");
		rl.question("Cosa vuoi fare?\n1 - Bilancio materie prime\n2 - Acquisto di una materia prima\n3 - Bilancio prodotti"
		 + "\n4 - Inserimento di un prodotto\n5 - Ricerca di una materia prima posseduta in base al nome\n6 - Ricerca di un prodotto posseduto in base al nome\n"
		 +"7 - Inserimento di una attività su una materia prima posseduta\n8 - Inserimento di una attività su un prodotto posseduto"
		 +"\n9 - Visualizzare le attività svolte su una materia prima posseduta\n10 - Visualizzare le attività svolte su un prodotto posseduto\n11 - Bilancio carbon footprint"
		 +"\n12 - Calcolare il carbon footprint di un prodotto posseduto\n13 - Ricerca di un carbon footprint posseduto in base al nome\n0 - Logout\n",
		 function(scelta) {
		
			let contract = new web3produttore.eth.Contract(abi, contractAddress);
			
			switch (scelta){
				case '1':
				case 'Bilancio materie prime':	
				case 'bilancio materie prime': 
					balanceMateriePrime(contract,produttore,"Bilancio");					 
					break;
				case '2':
				case 'Acquisto di una materia prima':
				case 'acquisto di una materia prima':
					cercaMat(contract);
					break;
				case '3':
				case 'Bilancio prodotti':	
				case 'bilancio prodotti': 
					balanceProdotti(contract,produttore,"Bilancio");
					break;
				case '4':
				case 'Inserimento di un prodotto':
				case 'inserimento di un prodotto':
					balanceMateriePrime(contract,produttore,"Inserimento");
					break;
				case '5':
				case 'Ricerca di una materia prima posseduta in base al nome':
				case 'Ricerca di una materia prima posseduta in base al nome':
					ricercaMatPossedute(contract,produttore);
					break;
				case '6':
				case 'Ricerca di un prodotto posseduto in base al nome':
				case 'ricerca di un prodotto posseduto in base al nome':
					ricercaProdottiPosseduti(contract,produttore);
					break;
				case '7':
				case "Inserimento di una attività su una materia prima posseduta":
				case "inserimento di una attività su una materia prima posseduta":
					balanceMateriePrime(contract,produttore,"Esecuzione");
					break;
				case '8':
				case "Inserimento di una attività su un prodotto posseduto":
				case "inserimento di una attività su un prodotto posseduto":
					balanceProdotti(contract,produttore,"Esecuzione");
					break;
				case '9':
				case "Visualizzare le attività svolte su una materia prima posseduta":
				case "visualizzare le attività svolte su una materia prima posseduta":
					switchBalance(contract,produttore);
					break;
				case '10':
				case "Visualizzare le attività svolte su un prodotto posseduto":
				case "visualizzare le attività svolte su un prodotto posseduto":
					switchBalanceProdotti(contract,produttore);
					break;
				case '11':
				case "Bilancio carbon footprint":
				case "Bilancio carbon footprint":
					balanceCarbonFootprint(contract,produttore,"Bilancio");
					break; 	
				case '12':
				case "Calcolare il carbon footprint di un prodotto posseduto":
				case "calcolare il carbon footprint di un prodotto posseduto":
					balanceProdotti(contract,produttore,"Carbon Footprint");
					break;
				case '13':
				case 'Ricerca di un carbon footprint posseduto in base al nome':
				case 'ricerca di un carbon footprint posseduto in base al nome':
					ricercaCarbonFootprintPosseduti(contract,produttore);
					break;
				case '0':
				case 'Logout':
				case 'logout':
					login();
					break;			
				default:
					console.log('\x1b[31m%s\x1b[0m',"L'opzione scelta non è valida");
					demoProduttore();
					break;
				}	
		})
	}
}

function demoConsumatore() {
	if (consumatore == null){
		console.log("Login non riuscito");
		login();
	} else {
		console.log('\x1b[36m%s\x1b[0m',"\nBenvenuto Consumatore!");
		rl.question("Cosa vuoi fare?\n1 - Bilancio \n2 - Acquisto di un prodotto associato a un carbon footprint\n3 - Ricerca di un carbon footprint posseduto in base al nome"
		+"\n4 - Visualizzare le attività svolte su una materia prima usata per un prodotto associato a un carbon footprint posseduto"
		+"\n5 - Visualizzare le attività svolte su un prodotto associato a un carbon footprint posseduto\n0 - Logout\n", function(scelta) {
		
			let contract = new web3consumatore.eth.Contract(abi, contractAddress);
			
			switch (scelta){
				case '1':
				case 'Bilancio':	
				case 'bilancio':				
					balanceCarbonFootprint(contract,consumatore,"Bilancio");									 
					break;
				case '2':
				case 'Acquisto di un prodotto associato a un carbon footprint':
				case 'acquisto di un prodotto associato a un carbon footprint':
					cercaProd(contract,consumatore);
					break;
				case '3':
				case 'Ricerca di un carbon footprint posseduto in base al nome':
				case 'ricerca di un carbon footprint posseduto in base al nome':
					ricercaCarbonFootprintPosseduti(contract,consumatore);
					break;
				case '4':
				case "Visualizzare le attività svolte su una materia prima usata per un prodotto associato a un carbon footprint posseduto":
				case "visualizzare le attività svolte su una materia prima usata per un prodotto associato a un carbon footprint posseduto":
					balanceCarbonFootprint(contract,consumatore,"Visualizza Task Materie Prime");
					break;
				case '5':
				case "Visualizzare le attività svolte su un prodotto associato a un carbon footprint posseduto":
				case "visualizzare le attività svolte su un prodotto associato a un carbon footprint posseduto":
					balanceCarbonFootprint(contract,consumatore,"Visualizza Task Prodotti");
					break;			
				case '0':
				case 'Logout':
				case 'logout':
					login();
					break;			
				default:
					console.log('\x1b[31m%s\x1b[0m',"L'opzione scelta non è valida");
					demoConsumatore();
					break;
				}	
		})
	}
}
function login(){	
				
		rl.question("\nChi sei?\n1 - Fornitore\n2 - Produttore\n3 - Consumatore\n", function(scelta) {
			switch(scelta){
				case '1':
				case 'Fornitore':
				case 'fornitore':					
					demoFornitore();										
					break;
				case '2':
				case 'Produttore':
				case 'produttore':
					demoProduttore();				
					break;
				case '3':
				case 'Consumatore':
				case 'consumatore':
					demoConsumatore();
					break;
				default:
					console.error('\x1b[31m%s\x1b[0m',"L'opzione scelta non è valida");
					login();
					break;				
			}		
		})
	
}


function deploy() {

var simpleContract = new web3produttore.eth.Contract(abi, { from: produttore } );


// 1. deploy the smart contract
simpleContract.deploy({data: bytecode, arguments: [produttore,fornitore,consumatore] }).
send({ from:produttore, gas: 30000000, gasPrice: '0' }, deploy_handler).
on('receipt', receipt_handler).then(()=>{
		
		login();
	});


}

async function deploy_handler(e) {
	if (e) {
	console.log('\x1b[31m%s\x1b[0m',"Si e' verificato un errore nella deploy dello smart contract", e);
	
	} 
}

function receipt_handler(receipt) {
try {
	contractAddress = receipt.contractAddress;
	fs.writeFile('contractaddress.txt', contractAddress, function (err) {
		if (err) return console.log(err);
		
	  });
	var hash = crypto.createHash('md5').update(contractAddress).digest("hex");
	fs.writeFile('contractaddresshash.txt', hash, function (err) {
		if (err) return console.log(err);
		
	  });
	
	
	console.log("Deploy effettuata con successo.\nIndirizzo dello smart contract: " + receipt.contractAddress);
	
	} catch (err) {
		console.error('\x1b[31m%s\x1b[0m',"Errore:", err);
	}			
}


async function balanceMateriePrime(contract,accountAddress,scelta){
	if (scelta == "Bilancio"){
		await contract.methods.balanceOf(accountAddress).call().then((b)=>{
			console.log('\x1b[36m%s\x1b[0m',`Il tuo bilancio è ${b} NFT\n`);
		})
	}	
	try{
	await contract.methods.searchTutteMateriePrimePossedute().call({from:accountAddress}).then((myObj)=>{
		if (myObj.length != 0){			
			if (scelta != 'Inserimento'){
				console.log('\x1b[35m%s\x1b[0m',"Elenco materie prime possedute:");
				for(i = 0; i < myObj.length; i++){
					console.log('\x1b[35m%s\x1b[0m',"\nMateria prima "+ (i+1) + ":");
					console.log('\x1b[36m%s\x1b[0m',"Nome materia prima:",  myObj[i][0]);
					console.log('\x1b[36m%s\x1b[0m',"Emissioni materia prima:", myObj[i][1] + " CO2 equivalente");
					console.log('\x1b[36m%s\x1b[0m',"Lotto materia prima:", myObj[i][2]);
					}}				
			switch (scelta){
				case 'Bilancio':
					switcher(accountAddress);
					break;						
				case 'Esecuzione':
				case 'Visualizza':
					cercaMatPerAttivita(contract,myObj,scelta,accountAddress);
					break;
				case 'Inserimento':
					inserimentoProd(myObj);
					break;	
				}				
									
			} else {
				if (scelta == 'Inserimento'){
					console.log('\x1b[31m%s\x1b[0m',"Errore! Per inserire un prodotto è necessario possedere almeno una materia prima.");
				} else {
					console.log('\x1b[31m%s\x1b[0m',"Non è disponibile nessuna materia prima ");
				}
				switcher(accountAddress);							
			}	})
						
	} catch (err){
		console.error('\x1b[31m%s\x1b[0m',"Si è verificato un errore:", err);
		switcher(accountAddress);
	}
}
async function balanceProdotti(contract,accountAddress,scelta){
	if (scelta == "Bilancio"){
	await contract.methods.balanceOf(accountAddress).call().then((b)=>{
		console.log('\x1b[36m%s\x1b[0m',`Il tuo bilancio è ${b} NFT\n`);
	})
	}
	try{	
	await contract.methods.searchTuttiProdottiPosseduti("Prodotto").call({from:accountAddress}).then((myObj)=>{
		if (myObj.length != 0){
			console.log('\x1b[33m%s\x1b[0m',"Elenco prodotti posseduti:");
			for(i = 0; i < myObj.length; i++){
				console.log('\x1b[33m%s\x1b[0m',"\nProdotto "+ (i+1) + ":");
				console.log('\x1b[36m%s\x1b[0m',"Nome prodotto:", myObj[i][0]);
				console.log('\x1b[36m%s\x1b[0m',"Emissioni di produzione:", myObj[i][1] + " CO2 equivalente");
				console.log('\x1b[36m%s\x1b[0m',"Emissioni totali del prodotto:", myObj[i][2] + " CO2 equivalente");
				console.log('\x1b[36m%s\x1b[0m',"Lotto prodotto:", myObj[i][3]);						
				for (j = 0; j<myObj[i][4].length;j++){
						console.log('\x1b[36m%s\x1b[0m',"Materia prima usata "+ (j+1) + ":", myObj[i][4][j] +
						 ", con carbon footprint pari a " + myObj[i][5][j] +
						 " CO2 equivalente" + ", proveniente dal lotto " + myObj[i][6][j]);						  						
					}
													
				}
				switch (scelta){
					case 'Bilancio':
						switcher(accountAddress);
						break;						
					case 'Esecuzione':
					case 'Visualizza':	
					case 'Carbon Footprint':		
						cercaProdPerAttivita(contract,myObj,scelta,accountAddress);
						break;
					case 'Visualizza Task Materie Prime Per Prodotti':	
						cercaMatPerAttivita(contract,myObj,scelta,accountAddress);
						break;
				}						
			} else {
				console.log('\x1b[31m%s\x1b[0m',"Non è disponibile nessun prodotto");
				switcher(accountAddress);							
			}	})				
	} catch (err){
		console.error('\x1b[31m%s\x1b[0m',"Errore: ", err);
		switcher(accountAddress);
	}
}
async function balanceCarbonFootprint(contract,accountAddress,scelta){
	if (scelta == "Bilancio"){
		await contract.methods.balanceOf(accountAddress).call().then((b)=>{
			console.log('\x1b[36m%s\x1b[0m',`Il tuo bilancio è ${b} NFT\n`);
		})
	}
	try{
	await contract.methods.searchTuttiProdottiPosseduti("Carbon Footprint").call({from:accountAddress}).then((myObj)=>{
		if (myObj.length != 0){
			console.log('\x1b[32m%s\x1b[0m',"Elenco prodotti associati a carbon footprint posseduti:");
			for(i = 0; i < myObj.length; i++){
				console.log('\x1b[32m%s\x1b[0m',"\nProdotto associato a carbon footprint "+ (i+1) + ":");
				console.log('\x1b[36m%s\x1b[0m',"Nome:" , myObj[i][0]);
				console.log('\x1b[36m%s\x1b[0m',"Carbon footprint:", myObj[i][2] + " CO2 equivalente");
				console.log('\x1b[36m%s\x1b[0m',"Lotto prodotto:", myObj[i][3]);						
				for (j = 0; j<myObj[i][4].length;j++){
						console.log('\x1b[36m%s\x1b[0m',"Materia prima usata "+ (j+1) + ":", myObj[i][4][j] +
						 ", con carbon footprint pari a " + myObj[i][5][j] +
						 " CO2 equivalente" + ", proveniente dal lotto " + myObj[i][6][j]);						
					}						
				}
				switch (scelta){
					case 'Bilancio':
						switcher(accountAddress);
						break;						
					case 'Visualizza Task Materie Prime':
						cercaMatPerAttivita(contract,myObj,scelta,accountAddress);
						break;
					case 'Visualizza Task Prodotti':		
						cercaProdPerAttivita(contract,myObj,scelta,accountAddress);
						break;
					
				}					
			} else {
				console.log('\x1b[31m%s\x1b[0m',"Non è disponibile nessun carbon footprint");
				switcher(accountAddress);							
			}	})
	} catch (err){
		console.error('\x1b[31m%s\x1b[0m',"Errore:", err);
		switcher(accountAddress)
	}
}
async function searchMateriePrimeByName(nomeMatPrima,contract,accountAddress){	
	try{
	
	await contract.methods.searchMateriePrime(nomeMatPrima,"Posseduti").call({from:accountAddress}).then((myObj)=>{
	if (myObj.length != 0){
		console.log('\x1b[35m%s\x1b[0m',`Elenco materie prime ${nomeMatPrima} possedute:`);
		for(i = 0; i < myObj.length; i++){
			console.log('\x1b[35m%s\x1b[0m',"\nMateria prima "+ (i+1) + ":");
				console.log('\x1b[36m%s\x1b[0m',"Nome materia prima:",  myObj[i][0]);
				console.log('\x1b[36m%s\x1b[0m',"Emissioni materia prima:", myObj[i][1] + " CO2 equivalente");
				console.log('\x1b[36m%s\x1b[0m',"Lotto materia prima:", myObj[i][2] );
			}				
		} else {
			console.log('\x1b[31m%s\x1b[0m',"Non è stata trovata nessuna materia prima "+ nomeMatPrima);							
		} });

								
	} catch (err){
		console.error('\x1b[31m%s\x1b[0m',"Errore:", err);
	}
	switcher(accountAddress);
}
async function searchProdottiByName(nomeProd,contract,accountAddress){	
	try{
	
	await contract.methods.searchProdotti(nomeProd).call({from:accountAddress}).then((myObj)=>{
		if (myObj.length != 0){
			console.log('\x1b[33m%s\x1b[0m',`Elenco prodotti ${nomeProd} posseduti:`);
			for(i = 0; i < myObj.length; i++){
				console.log('\x1b[33m%s\x1b[0m',"\nProdotto "+ (i+1) + ":");
				console.log('\x1b[36m%s\x1b[0m',"Nome prodotto:", myObj[i][0]);
				console.log('\x1b[36m%s\x1b[0m',"Emissioni di produzione:", myObj[i][1] + " CO2 equivalente");
				console.log('\x1b[36m%s\x1b[0m',"Emissioni totali del prodotto:", myObj[i][2] + " CO2 equivalente");
				console.log('\x1b[36m%s\x1b[0m',"Lotto prodotto:", myObj[i][3]);						
				for (j = 0; j<myObj[i][4].length;j++){
						console.log('\x1b[36m%s\x1b[0m',"Materia prima usata "+ (j+1) + ":", myObj[i][4][j] +
						 ", con carbon footprint pari a " + myObj[i][5][j] +
						 " CO2 equivalente" + ", proveniente dal lotto " + myObj[i][6][j]);						  						
					}		
				}
					
			} else {
				console.log('\x1b[31m%s\x1b[0m',"Non è stata trovata nessun prodotto "+ nomeProd);							
			} 
			
		});
			
	} catch (err){
		console.error('\x1b[31m%s\x1b[0m',"Errore:", err);
	}
	switcher(accountAddress);
}
async function searchCarbonFootprintByName(nomeProd,contract,accountAddress){	
	try{	
	await contract.methods.searchCarbonFootprint(nomeProd,"Posseduti").call({from:accountAddress}).then((myObj)=>{
		if (myObj.length != 0){
			console.log('\x1b[32m%s\x1b[0m',`Elenco prodotti ${nomeProd} associati a carbon footprint posseduti:`);
			for(i = 0; i < myObj.length; i++){
				console.log('\x1b[32m%s\x1b[0m',"\nProdotto associato a carbon footprint "+ (i+1) + ":");
				console.log('\x1b[36m%s\x1b[0m',"Nome:" , myObj[i][0]);
				console.log('\x1b[36m%s\x1b[0m',"Carbon footprint:", myObj[i][2] + " CO2 equivalente");
				console.log('\x1b[36m%s\x1b[0m',"Lotto prodotto:", myObj[i][3]);								
				for (j = 0; j<myObj[i][4].length;j++){
					console.log('\x1b[36m%s\x1b[0m',"Materia prima usata "+ (j+1) + ":", myObj[i][4][j] +
					", con carbon footprint pari a " + myObj[i][5][j] +
					" CO2 equivalente" + ", proveniente dal lotto " + myObj[i][6][j]);						
					}						
				}					
			} else {
				console.log('\x1b[31m%s\x1b[0m',"Non è stata trovata nessun carbon footprint "+ nomeProd);							
			} 
			
		});		
	} catch (err){
		console.error('\x1b[31m%s\x1b[0m',"Errore:", err);		
	}
	switcher(accountAddress);
}
function inserimentoMatPrima(nomeMatPrima, emissioniMatPrima, lottoMatPrima) {
	try {
				
		web3fornitore.eth.getTransactionCount(fornitore).then((value) => { 
			console.log("Numero transazione:", value); 

	    		// 2. generate a transaction to update the smart contract state
       		     	var myContract = new web3fornitore.eth.Contract(abi, contractAddress);
    			const tx = {
    				from: fornitore,
    				to: contractAddress,
    				data: myContract.methods.inserimentoMateriaPrima(nomeMatPrima,emissioniMatPrima,lottoMatPrima).encodeABI(),
				gas: 1500000, 
				gasPrice: '0',
				nonce: value
    			};
    
			const signPromise = web3fornitore.eth.signTransaction(tx, tx.from);

		    	
    			signPromise.then((signedTransaction) => {
    				const sentTx = web3fornitore.eth.sendSignedTransaction(signedTransaction.raw || signedTransaction.rawTransaction);
    
    				sentTx.on("error", (error) => {
    					console.log('\x1b[31m%s\x1b[0m',"C'è stato un errore nella transazione: "+ error.reason);
						demoFornitore();
    				});
				
				sentTx.on("receipt", (receipt) => {
					console.log("Inserimento avvenuto correttamente");
					demoFornitore();
				
				});
				
    			}).catch((error) => {
    
    				console.log('\x1b[31m%s\x1b[0m',"Errore:", error);
					demoFornitore();
    			}); 					
		});

	} catch (err) {
		console.error('\x1b[31m%s\x1b[0m',"Errore:", err);
		demoFornitore();
	}
}

async function acquistoMat(nomeMatPrima,contract){	
	try{
	
	await contract.methods.searchMateriePrime(nomeMatPrima,"Acquisto").call({from:produttore}).then((myObj)=>{
		if (myObj.length != 0){
			console.log('\x1b[35m%s\x1b[0m',`Elenco materie prime ${nomeMatPrima} disponibili da acquistare:`);
			for(i = 0; i < myObj.length; i++){
				console.log('\x1b[35m%s\x1b[0m',"\nMateria prima "+ (i+1) + ":");
				console.log('\x1b[36m%s\x1b[0m',"Nome materia prima:",  myObj[i][0]);
				console.log('\x1b[36m%s\x1b[0m',"Emissioni materia prima:", myObj[i][1] + " CO2 equivalente");
				console.log('\x1b[36m%s\x1b[0m',"Lotto materia prima:", myObj[i][2] );
				}
				scegliMat(nomeMatPrima,myObj);	
			} else {
				console.log('\x1b[31m%s\x1b[0m',"Non è disponibile nessuna materia prima "+ nomeMatPrima);
				demoProduttore();
			}
		});		
	} catch (err){
		console.error('\x1b[31m%s\x1b[0m',"Errore:", err);
		demoProduttore();
	}
}

function trasferisciMatPrima(nomeMatPrima, lottoMatPrima) {
	try {						
		web3fornitore.eth.getTransactionCount(fornitore).then((value) => { 
			console.log("Numero transazione:", value); 

	    		// 2. generate a transaction to update the smart contract state
       		     	var myContract = new web3fornitore.eth.Contract(abi, contractAddress);
    			const tx = {
    				from: fornitore,
    				to: contractAddress,
    				data: myContract.methods.acquista(nomeMatPrima,lottoMatPrima,fornitore,produttore,"Materia Prima").encodeABI(),
				gas: 1500000, 
				gasPrice: '0',
				nonce: value
    			};
    
			const signPromise = web3fornitore.eth.signTransaction(tx, tx.from);

		    	
    			signPromise.then((signedTransaction) => {
    				const sentTx = web3fornitore.eth.sendSignedTransaction(signedTransaction.raw || signedTransaction.rawTransaction);
    
    				sentTx.on("error", (error) => {
    					console.log('\x1b[31m%s\x1b[0m',"C'è stato un errore nella transazione: "+ error.reason);
						
    				});
				
				sentTx.on("receipt", (receipt) => {
					console.log("Acquisto avvenuto correttamente");
					
					demoProduttore();
					
				});
				
    			}).catch((error) => {
    
    				console.log('\x1b[31m%s\x1b[0m',"Errore:", error);
					demoProduttore();
    			}); 

					
		});

	} catch (err) {
		console.error('\x1b[31m%s\x1b[0m',"Errore:", err);
		demoProduttore();
	}
}	
function insProdotto(nomeProd, emissioniProd, lottoProd,nomeMatPrima,lottoMatPrima) {
		try {
			
			web3produttore.eth.getTransactionCount(produttore).then((value) => { 
				console.log("Numero transazione:", value); 
	
					// 2. generate a transaction to update the smart contract state
							var myContract = new web3produttore.eth.Contract(abi, contractAddress);
					const tx = {
						from: produttore,
						to: contractAddress,
						data: myContract.methods.inserimentoProdotto(nomeProd, emissioniProd, lottoProd,nomeMatPrima,lottoMatPrima).encodeABI(),
					gas: 1500000, 
					gasPrice: '0',
					nonce: value
					};
		
				const signPromise = web3produttore.eth.signTransaction(tx, tx.from);
	
					
					signPromise.then((signedTransaction) => {
						const sentTx = web3produttore.eth.sendSignedTransaction(signedTransaction.raw || signedTransaction.rawTransaction);
		
						sentTx.on("error", (error) => {
							console.log('\x1b[31m%s\x1b[0m',"C'è stato un errore nella transazione: "+ error.reason);
							demoProduttore();
						});
					
					sentTx.on("receipt", (receipt) => {
						console.log("Inserimento avvenuto correttamente");
						demoProduttore();
						
					});
					
					}).catch((error) => {
		
						console.log('\x1b[31m%s\x1b[0m',"Errore:", error);
						demoProduttore();
					}); 							
			});
	
		} catch (err) {
			console.error('\x1b[31m%s\x1b[0m',"Errore:", err);
			demoProduttore();
		}
		
}
function inserimentoTask(nomeTask,emissioniTask,nome,lotto,tipo) {
	try {
				
		web3produttore.eth.getTransactionCount(produttore).then((value) => { 
			console.log("Numero transazione:", value); 

	    		// 2. generate a transaction to update the smart contract state
       		     	var myContract = new web3produttore.eth.Contract(abi, contractAddress);
    			const tx = {
    				from: produttore,
    				to: contractAddress,
    				data: myContract.methods.inserimentoTask(nomeTask,emissioniTask,nome,lotto,tipo).encodeABI(),
				gas: 1500000, 
				gasPrice: '0',
				nonce: value
    			};
    
			const signPromise = web3produttore.eth.signTransaction(tx, tx.from);

		    	
    			signPromise.then((signedTransaction) => {
    				const sentTx = web3produttore.eth.sendSignedTransaction(signedTransaction.raw || signedTransaction.rawTransaction);
    
    				sentTx.on("error", (error) => {
    					console.log('\x1b[31m%s\x1b[0m',"C'è stato un errore nella transazione: "+ error.reason);
						demoProduttore();
    				});
				
				sentTx.on("receipt", (receipt) => {
					console.log("Inserimento avvenuto correttamente");
					demoProduttore();
				
				});
				
    			}).catch((error) => {
    
    				console.log('\x1b[31m%s\x1b[0m',"Errore:", error);
					demoProduttore();
    			}); 					
		});

	} catch (err) {
		console.error('\x1b[31m%s\x1b[0m',"Errore:", err);
		demoProduttore();
	}
}
function calcoloCarbonFootprint(nomeProd,lottoProd) {
	try {				
		web3produttore.eth.getTransactionCount(produttore).then((value) => { 
			console.log("Numero transazione:", value); 

	    		// 2. generate a transaction to update the smart contract state
       		     	var myContract = new web3produttore.eth.Contract(abi, contractAddress);
    			const tx = {
    				from: produttore,
    				to: contractAddress,
    				data: myContract.methods.calcoloCarbonFootprint(nomeProd,lottoProd).encodeABI(),
				gas: 1500000, 
				gasPrice: '0',
				nonce: value
    			};
    
			const signPromise = web3produttore.eth.signTransaction(tx, tx.from);

		    	
    			signPromise.then((signedTransaction) => {
    				const sentTx = web3produttore.eth.sendSignedTransaction(signedTransaction.raw || signedTransaction.rawTransaction);
    
    				sentTx.on("error", (error) => {
    					console.log('\x1b[31m%s\x1b[0m',"C'è stato un errore nella transazione: "+ error.reason);
						demoProduttore();
    				});
				
				sentTx.on("receipt", (receipt) => {
					console.log("Calcolo avvenuto correttamente");
					demoProduttore();
				
				});
				
    			}).catch((error) => {
    
    				console.log('\x1b[31m%s\x1b[0m',"Errore:", error);
					demoProduttore();
    			}); 					
		});

	} catch (err) {
		console.error('\x1b[31m%s\x1b[0m',"Errore:", err);
		demoProduttore();
	}
}
async function visualizzaAttivitaMat(nomeMatPrima,lottoMatPrima,contract,accountAddress){
	contract.methods.getTask(nomeMatPrima,lottoMatPrima,"Materia Prima").call({from:accountAddress}).then((myTasks)=>{
		if (myTasks.length != 0){
			console.log('\x1b[36m%s\x1b[0m',"Attività svolte sulla materia prima "+ nomeMatPrima + " del lotto " + lottoMatPrima + ":\n");
			for(k = 0; k < myTasks.length; k++){									
				console.log('\x1b[36m%s\x1b[0m',"Attività "+(k+1)+":", myTasks[k][0] + " con emissioni pari a " + myTasks[k][1] + " CO2 equivalente");													
			}
		} else {
			console.log("Non è stata svolta nessuna attività sulla materia prima "+ nomeMatPrima + " e lotto " + lottoMatPrima );									
		}
		switcher(accountAddress);	
	})		
}
async function visualizzaAttivitaProdotto(nomeProd,lottoProd,contract,accountAddress){
	contract.methods.getTask(nomeProd,lottoProd,"Prodotto").call({from:accountAddress}).then((myTasks)=>{
		if (myTasks.length != 0){
			console.log('\x1b[36m%s\x1b[0m',"Attività svolte sul prodotto "+ nomeProd + " del lotto " + lottoProd + ":\n");
			for(k = 0; k < myTasks.length; k++){									
				console.log('\x1b[36m%s\x1b[0m',"Attività "+(k+1)+":", myTasks[k][0] + " con emissioni pari a " + myTasks[k][1] + " CO2 equivalente");													
			}
		} else {
			console.log("Non è stata svolta nessuna attività sul prodotto "+ nomeProd + " e lotto " + lottoProd );									
		}
		switcher(accountAddress);	
	})		
}
async function acquistoProd(nomeProd,contract,accountAddress){
	try{	
		await contract.methods.searchCarbonFootprint(nomeProd,"Acquisto").call({from:accountAddress}).then((myObj)=>{
			if (myObj.length != 0){
				console.log('\x1b[32m%s\x1b[0m',`Elenco prodotti ${nomeProd} associati a carbon footprint disponibili da acquistare:`);
				for(i = 0; i < myObj.length; i++){
					console.log('\x1b[32m%s\x1b[0m',"\nProdotto associato a carbon footprint "+ (i+1) + ":");
					console.log('\x1b[36m%s\x1b[0m',"Nome:" , myObj[i][0]);
					console.log('\x1b[36m%s\x1b[0m',"Carbon footprint:", myObj[i][2] + " CO2 equivalente");
					console.log('\x1b[36m%s\x1b[0m',"Lotto prodotto:", myObj[i][3]);								
					for (j = 0; j<myObj[i][4].length;j++){
						console.log('\x1b[36m%s\x1b[0m',"Materia prima usata "+ (j+1) + ":", myObj[i][4][j] +
						", con carbon footprint pari a " + myObj[i][5][j] +
						" CO2 equivalente" + ", proveniente dal lotto " + myObj[i][6][j]);						
						}																
					}
					scegliProd(nomeProd,myObj);																	
				} else {
					console.log("Non è disponibile nessun prodotto associato a un carbon footprint");
					switcher(accountAddress);							
				}	})				
		} catch (err){
			console.error('\x1b[31m%s\x1b[0m',"Errore:", err);
			switcher(accountAddress);
		}
}

function trasferisciProd(nomeProd, lottoProd) {
	try {						
		web3produttore.eth.getTransactionCount(produttore).then((value) => { 
			console.log("Numero transazione:", value); 

	    		// 2. generate a transaction to update the smart contract state
       		     	var myContract = new web3produttore.eth.Contract(abi, contractAddress);
    			const tx = {
    				from: produttore,
    				to: contractAddress,
    				data: myContract.methods.acquista(nomeProd,lottoProd,produttore,consumatore,"Prodotto").encodeABI(),
				gas: 1500000, 
				gasPrice: '0',
				nonce: value
    			};
    
			const signPromise = web3produttore.eth.signTransaction(tx, tx.from);

		    	
    			signPromise.then((signedTransaction) => {
    				const sentTx = web3produttore.eth.sendSignedTransaction(signedTransaction.raw || signedTransaction.rawTransaction);
    
    				sentTx.on("error", (error) => {
    					console.log('\x1b[31m%s\x1b[0m',"C'è stato un errore nella transazione: "+ error.reason);
						demoConsumatore();
    				});
				
				sentTx.on("receipt", (receipt) => {
					console.log("Acquisto avvenuto correttamente");
					
					demoConsumatore();
					
				});
				
    			}).catch((error) => {
    
    				console.log('\x1b[31m%s\x1b[0m',"Errore:", error);
					demoConsumatore();
    			}); 

					
		});

	} catch (err) {
		console.error('\x1b[31m%s\x1b[0m',"Errore:", err);
		demoConsumatore();
	}
}
const questionAlphanumeric = (domanda) => {
	var promessa= new Promise((resolve, reject) => {
	   rl.question(domanda, (answer) => {
		  if(validator.matches(answer,/^[a-zA-Z0-9 ]*$/)){
			console.log(`Hai inserito: ${answer}\n`);
			resolve(answer);
		  } else {
			console.log('\x1b[31m%s\x1b[0m',"Inserire esclusivamente caratteri alfanumerici\n");
		  	resolve(null)
		  }
	   })
	})
	return promessa;
 }
 const questionMultiAlphanumeric = (domanda) => {
	var promessa= new Promise((resolve, reject) => {
	   rl.question(domanda, (answer) => {
		  if(validator.matches(answer,/^[a-zA-Z0-9 ,]*$/)){
			console.log(`Hai inserito: ${answer}\n`);
			resolve(answer);
		  } else {
			console.log('\x1b[31m%s\x1b[0m',"Inserire esclusivamente caratteri alfanumerici\n");
		  	resolve(null)
		  }
	   })
	})
	return promessa;
 }

 const questionNumeric = (domanda) => {
	var promessa= new Promise((resolve, reject) => {
	   rl.question(domanda, (answer) => {
		  if(validator.isNumeric(answer,{no_symbols: true}) && Number.isSafeInteger(validator.toInt(answer))){
			console.log(`Hai inserito: ${answer}\n`);
			resolve(answer);
		  } else {
			  if(!(validator.isNumeric(answer))){
				console.log('\x1b[31m%s\x1b[0m',"Inserire esclusivamente numeri interi\n");
			  }
			  else if (answer <= 0){
				console.log('\x1b[31m%s\x1b[0m',"Inserire numeri maggiori di 0\n");
			  }
			  else if(!(Number.isInteger(answer))) {
				  if(answer > Number.MAX_SAFE_INTEGER){
					console.log('\x1b[31m%s\x1b[0m',"Overflow - Sono stati inseriti numeri troppo grandi\n");				
				  }
				  else{
					console.log('\x1b[31m%s\x1b[0m',"Inserire esclusivamente numeri interi\n");
				  }
			  }
			  else if(!(Number.isSafeInteger(answer))){
				
			  }
		  	resolve(false);
		  }
	   })
	})
	return promessa;
 }

 const question1 =async (domanda) => {
	 
	var stringa=null;
	while(stringa == null){
		stringa = await questionAlphanumeric(domanda);
	}
	return stringa;
 }
 const question2 =async (domanda) => {
	 
	var number=false;
	while(number == false){
		number = await questionNumeric(domanda);
	}
	return number;
 }
 const question3 =async (domanda) => {
	 
	var number=false;
	while(number == false){
		number = await questionMultiAlphanumeric(domanda);
	}
	return number;
 }
  function switcher(accountAddress){
	switch (accountAddress){
		case fornitore:
			demoFornitore();
			break;							
		case produttore:
			demoProduttore();
			break;
		case consumatore:
			demoConsumatore();
			break;		
		default:
			login();
			break;										
	}
  }
  const inserimentoMat = async () => {
	  
	nomeMatPrima = await question1('\nInserire il nome della materia prima: ');
	emissioniMatPrima = await question2(`Inserire le emissioni prodotte dalla materia prima ${nomeMatPrima}: `);
	lottoMatPrima = await question1(`Inserire il lotto della materia prima ${nomeMatPrima}: `);
	
	inserimentoMatPrima(nomeMatPrima,emissioniMatPrima,lottoMatPrima);
  }
  const inserimentoProd = async (myObj) => {
	
	nomeProd = await question1('\nInserire il nome del prodotto: ');
	emissioniProd = await question2(`Inserire le emissioni di produzione del prodotto ${nomeProd}: `);
	
	lottoProd = await question1(`Inserire il lotto del prodotto ${nomeProd}: `);
	console.log('\x1b[35m%s\x1b[0m',"Materie prime possedute:")
	for(i = 0; i < myObj.length; i++){
		console.log('\x1b[35m%s\x1b[0m',"\nMateria prima "+ (i+1) + ":");
		console.log('\x1b[36m%s\x1b[0m',"Nome materia prima:",  myObj[i][0]);
		console.log('\x1b[36m%s\x1b[0m',"Emissioni materia prima:", myObj[i][1] + " CO2 equivalente");
		console.log('\x1b[36m%s\x1b[0m',"Lotto materia prima:", myObj[i][2]);
		}
	
	var flag = false;
	var listaMatPrima = [];
	while (flag == false){
		var temp = "";
		while (temp == ""){
		temp = await question3(`\nInserire le materia prime utilizzate separate da una virgola: `);
		if (temp == ""){
			console.log('\x1b[31m%s\x1b[0m',"Errore: Inserire almeno una materia prima");
			}
		}
		var cont = 0;
		listaMatPrima = temp.trim().split(/\s*,\s*/);
		for(i = 0; i< listaMatPrima.length;i++){
			for(var j = 0; j < myObj.length; j++){
				if (listaMatPrima[i] == myObj[j][0]){
					cont++;
					break;
				}
			}
		}
		if(cont == listaMatPrima.length){
			flag = true;
		} else {
			console.log('\x1b[31m%s\x1b[0m',"Errore: Inserire correttamente le materie prime");
		}
		
	}
	var i = 0;
	var lottoMatPrima = [];
	
	while(lottoMatPrima.length != listaMatPrima.length){
		flag = false;
		while((lottoMatPrima[i] == null) || (lottoMatPrima[i] == "") || (flag == false)){
			lottoMatPrima[i] = await question1(`Inserire il lotto della materia prima ${listaMatPrima[i]}: `);
			for (var j = 0; j < myObj.length; j++){
				if(listaMatPrima[i] == myObj[j][0]){
					if(lottoMatPrima[i] == myObj[j][2]){
						flag = true;
						break;
					}
				}
			}
			if ((lottoMatPrima[i] == "") || (flag == false)){			
				console.log('\x1b[31m%s\x1b[0m',"Errore: Inserire un lotto valido\n");
			}
		}
		i++;
	}

	insProdotto(nomeProd,emissioniProd,lottoProd,listaMatPrima,lottoMatPrima);
  }
  const cercaMatPerAttivita = async (contract,myObj,tipo,accountAddress) => {
	  switch (tipo){
		case 'Esecuzione':
			nomeMatPrima = await question1("\nInserire la materia prima posseduta su cui eseguire l'attività: ");
			break;
		case 'Visualizza':
			nomeMatPrima = await question1("\nInserire la materia prima posseduta di cui visualizzare le attività svolte: ");
			break;
		case 'Visualizza Task Materie Prime Per Prodotti':
			nomeMatPrima = await question1("\nInserire la materia prima, usata per un prodotto posseduto, di cui visualizzare le attività svolte: ");
			break;	
		case 'Visualizza Task Materie Prime':
			nomeMatPrima = await question1("\nInserire la materia prima, usata per un prodotto associato a un carbon footprint posseduto, di cui visualizzare le attività svolte: ");
			break;	
	  }
	
	lottoMatPrima = await question1(`Inserire il lotto della materia prima ${nomeMatPrima}: `);
	var flag = false;
	for (i = 0; i<myObj.length; i++){
		switch (tipo){
			case 'Esecuzione':
			case 'Visualizza':
				if ((nomeMatPrima ==  myObj[i][0]) && (lottoMatPrima == myObj[i][2])) {
					flag = true;	
				} 					
				break;
			case 'Visualizza Task Materie Prime Per Prodotti':
			case 'Visualizza Task Materie Prime':
				for (j = 0; j<myObj[i][4].length;j++){
					if ((nomeMatPrima == myObj[i][4][j]) && (lottoMatPrima == myObj[i][6][j])){
						flag = true;
					}					
				}
				break;	
		
		}
	}

	if (flag == true){
		switch (tipo){
			case 'Esecuzione':
				inserimentoAttivita(nomeMatPrima, lottoMatPrima);
				break;
			case 'Visualizza':
			case 'Visualizza Task Materie Prime Per Prodotti':
			case 'Visualizza Task Materie Prime':
				visualizzaAttivitaMat(nomeMatPrima, lottoMatPrima,contract,accountAddress);
				break;			
				
		}
		
	} else {
		console.log('\x1b[31m%s\x1b[0m',"Errore: Inserire un nome e un lotto validi");
		cercaMatPerAttivita(contract,myObj,tipo,accountAddress);
	}				
			
}

  const inserimentoAttivita = async (nomeMatPrima,lottoMatPrima) => {
	nomeTask = await question1(`\nInserire l'attività svolta sulla materia prima ${nomeMatPrima}: `);
	emissioniTask = await question2(`Inserire le emissioni prodotte dall'attività ${nomeTask}: `);	
	
	inserimentoTask(nomeTask,emissioniTask,nomeMatPrima,lottoMatPrima,"Materia Prima");
  }
  const cercaProdPerAttivita = async (contract,myObj,tipo,accountAddress) => {
	 switch (tipo){
		 case 'Esecuzione':
			nomeProd = await question1("\nInserire il prodotto posseduto su cui eseguire l'attività: ");
			break;
		case 'Visualizza':
			nomeProd = await question1("\nInserire il prodotto posseduto di cui visualizzare le attività svolte: ");
			break;
		case 'Carbon Footprint':
			nomeProd = await question1("\nInserire il prodotto posseduto di cui calcolare il carbon footprint: ");
			break;
		case 'Visualizza Task Prodotti':
			nomeProd = await question1("\nInserire il prodotto associato a un carbon footprint posseduto di cui visualizzare le attività svolte: ");
			break;	
	 } 	
	
	lottoProd = await question1(`Inserire il lotto del prodotto ${nomeProd}: `);
	var flag = false;
	for (i = 0; i<myObj.length; i++){
		if ((nomeProd ==  myObj[i][0]) && (lottoProd == myObj[i][3])){
			flag = true;
		}
	}
	if (flag == true){
		switch (tipo){
			case 'Esecuzione':
				inserimentoAttivitaProd(nomeProd, lottoProd);
			   break;
		    case 'Visualizza':
			case 'Visualizza Task Prodotti':
				visualizzaAttivitaProdotto(nomeProd, lottoProd,contract,accountAddress);
			   break;
		    case 'Carbon Footprint':
				calcoloCarbonFootprint(nomeProd,lottoProd);
				break;

		} 	
		
	} else {
		console.log('\x1b[31m%s\x1b[0m',"Errore: Inserire nome e lotto validi");
		cercaProdPerAttivita(contract,myObj,tipo,accountAddress);
	}				
			
}
  const inserimentoAttivitaProd = async (nomeProd,lottoProd) => {
	nomeTask = await question1(`\nInserire l'attività svolta sul prodotto ${nomeProd}: `);
	emissioniTask = await question2(`Inserire le emissioni prodotte dall'attività ${nomeTask}: `);	
	
	inserimentoTask(nomeTask,emissioniTask,nomeProd,lottoProd,"Prodotto");
  }
  const cercaMat = async (contract) => {
	  nomeMatPrima = await question1("\nInserire la materia prima da acquistare: ");
	  acquistoMat(nomeMatPrima,contract);
  }
  const scegliMat = async (nomeMatPrima,myObj) => {
	lottoMatPrima = await question1(`\nInserire il lotto della materia prima ${nomeMatPrima} da acquistare: `);
	var flag = false;
	for (i = 0; i<myObj.length; i++){
		if (lottoMatPrima == myObj[i][2]){
			flag = true;
		}
	}
	if (flag == true){
		trasferisciMatPrima(nomeMatPrima, lottoMatPrima);
	} else {
		console.log('\x1b[31m%s\x1b[0m',"Errore: Inserire un lotto valido");
		scegliMat(nomeMatPrima,myObj);
	}
	
}
  
const ricercaMatPossedute = async (contract,accountAddress) => {
	nomeMatPrima = await question1("\nInserire la materia prima posseduta da cercare: ");
	searchMateriePrimeByName(nomeMatPrima,contract,accountAddress);
}
const ricercaProdottiPosseduti = async (contract,accountAddress) => {
	nomeProd = await question1("\nInserire il prodotto posseduto da cercare: ");
	searchProdottiByName(nomeProd,contract,accountAddress);
}
const ricercaCarbonFootprintPosseduti = async (contract,accountAddress) => {
	nomeProd = await question1("\nInserire il prodotto posseduto associato a un carbon footprint da cercare: ");
	searchCarbonFootprintByName(nomeProd,contract,accountAddress);
}
const cercaProd = async (contract,accountAddress) => {
	nomeProd = await question1("\nInserire il prodotto associato a un carbon footprint da acquistare: ");
	acquistoProd(nomeProd,contract,accountAddress);
}
const scegliProd = async (nomeProd,myObj) => {
  lottoProd = await question1(`\nInserire il lotto del prodotto ${nomeProd} da acquistare: `);
  var flag = false;
  for (i = 0; i<myObj.length; i++){
	  if (lottoProd == myObj[i][3]){
		  flag = true;
	  }
  }
  if (flag == true){
	  trasferisciProd(nomeProd, lottoProd);
  } else {
	  console.log('\x1b[31m%s\x1b[0m',"Errore: Inserire un lotto valido");
	  scegliProd(nomeProd,myObj);
  }
  
}
const switchBalance = async (contract,accountAddress) => {
	
		rl.question('\nPer cosa vuoi cercare le attività svolte?\n1 - Una materia prima attualmente posseduta e non ancora usata'
		+'\n2 - Una materia prima usata per un prodotto attualmente posseduto'
		+'\n3 - Una materia prima usata per un prodotto associato a un carbon footprint posseduto\n', (answer) => {
		  switch (answer){
			case '1':
				balanceMateriePrime(contract,accountAddress,"Visualizza");
				  break;
			case '2':
				balanceProdotti(contract,accountAddress,"Visualizza Task Materie Prime Per Prodotti");
				  break;
			case '3':
				balanceCarbonFootprint(contract,accountAddress,"Visualizza Task Materie Prime");
				  break;
			default:
				console.log('\x1b[31m%s\x1b[0m',"Errore: Inserire un'opzione valida");
				switchBalance(contract,accountAddress);
				break;	  			 
		  }
		});
}
const switchBalanceProdotti = async (contract,accountAddress) => {
	
	rl.question('\nPer cosa vuoi cercare le attività svolte?\n1 - Un prodotto attualmente posseduto di cui non si è calcolato il carbon footprint'
	+'\n2 - Un prodotto attualmente posseduto di cui si è calcolato il carbon footprint\n', (answer) => {
	  switch (answer){
		case '1':
			balanceProdotti(contract,accountAddress,"Visualizza");
			  break;
		case '2':
			balanceCarbonFootprint(contract,accountAddress,"Visualizza Task Prodotti");
			  break;
		default:
			console.log('\x1b[31m%s\x1b[0m',"Errore: Inserire un'opzione valida");
			switchBalance(contract,accountAddress);
			break;	  			 
	  }
	});
}
