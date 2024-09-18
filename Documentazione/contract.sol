// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Test is ERC721{

    using Counters for Counters.Counter;
    using SafeMath for uint;

    struct MateriaPrima {
        string nomeMateriaPrima;
        uint emissioni;
        string lottoMateriaPrima;
    }
    struct Prodotto{      
        string nomeProdotto;
        uint emissioniProduzione;
        uint emissioniTotali;
        string lottoProdotto;
        string[] nomiMateriePrimeUsate;
        uint[] emissioniMateriePrimeUsate;
        string[] lottiMateriePrimeUsate;
    }

    struct Task{
        string nomeTask;
        uint emissioniTask;
        string nome;
        string lotto;       
    }

    mapping(uint => Prodotto) listaProdotti;
    mapping(uint => MateriaPrima) listaMateriePrime;
    mapping(uint =>Task[]) listaTask;
    mapping(uint => Prodotto) listaCarbonFootprint;

    address produttore;
    address fornitore;
    address consumatore;
    uint counter;
    uint idToken;
    string messaggioErrore;
    MateriaPrima materiaPrima;
    Prodotto prodotto;
    Task task;
    Counters.Counter counterMateriaPrima;
    Counters.Counter counterProdotto;
    Counters.Counter counterCarbonFootprint;

    
    constructor(address _produttore,address _fornitore,address _consumatore) ERC721("", "") { 
        produttore = _produttore;
        consumatore =_consumatore;
        fornitore = _fornitore;
    }
    
    function inserimentoMateriaPrima(string memory _nome, uint _emissioni, string memory _lottoMateriaPrima) public {
        require(msg.sender == fornitore, "Solo il fornitore puo' inserire una nuova materia prima");
        require(_emissioni > 0);
        require(searchIndexMP(_nome, _lottoMateriaPrima) == 0, "Materia prima gia' inserita");
        counterMateriaPrima.increment();
        counter = counterMateriaPrima.current();
        listaMateriePrime[counter] = MateriaPrima({
            nomeMateriaPrima: _nome,
            emissioni: _emissioni,
            lottoMateriaPrima: _lottoMateriaPrima
        });
        
        idToken = generaToken(counter, "1");
        _mint(fornitore, idToken);
    }

    function inserimentoProdotto(string memory _nomeProdotto, uint _emissioniProduzione, string memory _lottoProdotto, string[] memory _nomiMateriePrimeUsate, string[] memory _lottiMateriePrimeUsate) public {
        require(msg.sender == produttore, "Solo il produttore puo' inserire un nuovo prodotto");
        require(_emissioniProduzione > 0);
        require(searchIndexProdotto(_nomeProdotto, _lottoProdotto) == 0, "Prodotto gia' inserito");
        counterProdotto.increment();
        uint index;
        uint _emissioniTotali = _emissioniProduzione;
        uint[] memory _emissioniMateriePrimeUsate = new uint[](_nomiMateriePrimeUsate.length);

        for (uint i = 0; i < _nomiMateriePrimeUsate.length; i++){
            index = searchIndexMP(_nomiMateriePrimeUsate[i], _lottiMateriePrimeUsate[i]);
            idToken = generaToken(index, "1");
            messaggioErrore = string(abi.encodePacked("Non si possiede la materia prima ", _nomiMateriePrimeUsate[i]));
            require(ownerOf(idToken) == produttore, messaggioErrore);
        }

        for (uint i = 0; i < _nomiMateriePrimeUsate.length; i++){
            index = searchIndexMP(_nomiMateriePrimeUsate[i], _lottiMateriePrimeUsate[i]);
            
            _emissioniTotali = SafeMath.add(_emissioniTotali,listaMateriePrime[index].emissioni);            
            _emissioniMateriePrimeUsate[i] = listaMateriePrime[index].emissioni;
            idToken = generaToken(index, "1");
            for(uint j = 0; j< listaTask[idToken].length;j++){
                 _emissioniTotali = SafeMath.add(_emissioniTotali,listaTask[idToken][j].emissioniTask);
            }
           
            _burn(idToken);
        }
        counter = counterProdotto.current();

        listaProdotti[counter] = Prodotto({
            nomeProdotto: _nomeProdotto,
            emissioniProduzione: _emissioniProduzione,
            emissioniTotali: _emissioniTotali,
            lottoProdotto: _lottoProdotto,
            nomiMateriePrimeUsate: _nomiMateriePrimeUsate,
            emissioniMateriePrimeUsate: _emissioniMateriePrimeUsate,
            lottiMateriePrimeUsate: _lottiMateriePrimeUsate
        });
        
        idToken = generaToken(counter, "2");
        _mint(produttore, idToken);
        
    }

    function inserimentoTask(string memory _nomeTask, uint _emissioniTask, string memory _nome, string memory _lotto, string memory tipo) public {
        require(msg.sender == produttore, "Solo il produttore puo' inserire una attivita'");
        require(_emissioniTask > 0);
        uint index;
        if (keccak256(abi.encodePacked("Materia Prima")) == keccak256(abi.encodePacked(tipo))){
        index = searchIndexMP(_nome, _lotto);
        idToken = generaToken(index, "1");
        messaggioErrore = string(abi.encodePacked("Non si possiede la materia prima ", _nome));               
        } else if(keccak256(abi.encodePacked("Prodotto")) == keccak256(abi.encodePacked(tipo))){
            index = searchIndexProdotto(_nome, _lotto);
            idToken = generaToken(index, "2");
            messaggioErrore = string(abi.encodePacked("Non si possiede il prodotto ", _nome));
        }
        require(ownerOf(idToken) == produttore, messaggioErrore);
        require(searchTask(idToken,_nomeTask) == false, "Attivita' gia' inserita");
               
       
        task = Task({
            nomeTask: _nomeTask,
            emissioniTask: _emissioniTask,
            nome: _nome,
            lotto: _lotto
        });
        listaTask[idToken].push(task);
        
    }

    function calcoloCarbonFootprint(string memory _nomeProdotto,string memory _lottoProdotto)public{
        require(msg.sender == produttore, "Solo il produttore puo' effettuare il calcolo del carbon footprint");
        uint index = searchIndexProdotto(_nomeProdotto, _lottoProdotto);
        require( index != 0, "Prodotto non esistente");
        
        idToken = generaToken(index, "2");
        messaggioErrore = string(abi.encodePacked("Non si possiede il prodotto ", _nomeProdotto));  
        require(ownerOf(idToken) == produttore, messaggioErrore);
        counterCarbonFootprint.increment();
        uint _emissioniTotali = listaProdotti[index].emissioniTotali;
        for(uint j = 0; j< listaTask[idToken].length;j++){
               _emissioniTotali = SafeMath.add(_emissioniTotali,listaTask[idToken][j].emissioniTask);
            }                             
        
        _burn(idToken);
        counter = counterCarbonFootprint.current();

        listaCarbonFootprint[counter] = listaProdotti[index];
        listaCarbonFootprint[counter].emissioniTotali = _emissioniTotali;
        
        idToken = generaToken(counter, "3");
        _mint(produttore, idToken);
    }
    
    function acquista(string memory name, string memory lotto, address from,address to,string memory scelta) public{
        uint index;
        if (keccak256(abi.encodePacked("Materia Prima")) == keccak256(abi.encodePacked((scelta)))){
        index = searchIndexMP(name,lotto);
        idToken = generaToken(index,"1");
        safeTransferFrom(from,to,idToken);
        } else if (keccak256(abi.encodePacked("Prodotto")) == keccak256(abi.encodePacked(scelta))){
        index = searchIndexCarbonFootprint(name,lotto);
        idToken = generaToken(index,"3");
        safeTransferFrom(from,to,idToken);
        }
    }

    function searchIndexMP(string memory name, string memory lotto) public view returns(uint index){
        
            for (uint i = 1; i <= counterMateriaPrima.current(); i++)  {
                
                if (keccak256(abi.encodePacked((listaMateriePrime[i].nomeMateriaPrima))) == keccak256(abi.encodePacked((name))) && (keccak256(abi.encodePacked((listaMateriePrime[i].lottoMateriaPrima))) == keccak256(abi.encodePacked((lotto))))) {
                    return i;  
                }
            }  
        return 0;
   }

       function searchIndexProdotto(string memory name, string memory lotto) public view returns(uint index){
        
            for (uint i = 1; i <= counterProdotto.current(); i++)  {
                
                if (keccak256(abi.encodePacked((listaProdotti[i].nomeProdotto))) == keccak256(abi.encodePacked((name))) && (keccak256(abi.encodePacked((listaProdotti[i].lottoProdotto))) == keccak256(abi.encodePacked((lotto))))) {
                    return i;  
                }
            }  
        return 0;
   }
   function searchIndexCarbonFootprint(string memory name, string memory lotto) public view returns(uint index){
        
            for (uint i = 1; i <= counterCarbonFootprint.current(); i++)  {
                
                if (keccak256(abi.encodePacked((listaCarbonFootprint[i].nomeProdotto))) == keccak256(abi.encodePacked((name))) && (keccak256(abi.encodePacked((listaCarbonFootprint[i].lottoProdotto))) == keccak256(abi.encodePacked((lotto))))) {
                    return i;  
                }
            }  
        return 0;
   }

    function searchTask(uint _idToken, string memory _nomeTask) public view returns(bool){         
           for (uint i = 0; i<listaTask[_idToken].length; i++ ){             
                if (keccak256(abi.encodePacked((listaTask[_idToken][i].nomeTask))) == keccak256(abi.encodePacked((_nomeTask))) ) {
                    return true;  
                }                             
            }
            return false; 
    }

    function searchMateriePrime(string memory name, string memory scelta) public view returns(MateriaPrima[] memory) {
        require((msg.sender == produttore) || (msg.sender == fornitore), "Solo il fornitore e il produttore possono cercare le materie prime");
        
        uint[] memory tokens = new uint[](counterMateriaPrima.current());
        uint j = 0;
        uint s = 0;
        uint dim = 0;
        for (uint i = 1; i <= counterMateriaPrima.current(); i++)  {
            
            if (keccak256(abi.encodePacked((listaMateriePrime[i].nomeMateriaPrima))) == keccak256(abi.encodePacked((name)))) {
                tokens[j] = i; 
                j++; 
            }
        }

        for(uint k=0; k < j; k++){
            if (_exists(generaToken(tokens[k],"1"))) {
                if (keccak256(abi.encodePacked(("Acquisto"))) == keccak256(abi.encodePacked((scelta)))){
                    require(msg.sender == produttore, "Solo il produttore puo' acquistare materia prima");
                    if (((ownerOf(generaToken(tokens[k],"1")) == fornitore))){                       
                        dim++;    
                    } 
                } else if (keccak256(abi.encodePacked(("Posseduti"))) == keccak256(abi.encodePacked((scelta)))){
                    if (((ownerOf(generaToken(tokens[k],"1")) == msg.sender))){
                    dim++; 
                    }   
                }
            }
            
        }
        
        MateriaPrima[] memory _materiePrime = new MateriaPrima[](dim);
        
        for (uint k = 0; k < j; k++){
            if (_exists(generaToken(tokens[k],"1"))) {
                if (keccak256(abi.encodePacked(("Acquisto"))) == keccak256(abi.encodePacked((scelta)))){
                    require(msg.sender == produttore, "Solo il produttore puo' acquistare materia prima");
                    if (((ownerOf(generaToken(tokens[k],"1")) == fornitore))){
                        _materiePrime[s] = listaMateriePrime[tokens[k]];
                        s++;    
                    } 
                } else if (keccak256(abi.encodePacked(("Posseduti"))) == keccak256(abi.encodePacked((scelta)))){
                    if (((ownerOf(generaToken(tokens[k],"1")) == msg.sender))){
                    _materiePrime[s] = listaMateriePrime[tokens[k]];
                    s++; 
                    }   
                } 
                
            }
        }
    return _materiePrime;
        
    }

    function searchProdotti(string memory name) public view returns(Prodotto[] memory){
    require(msg.sender == produttore, "Solo il produttore puo' cercare prodotti in fase di lavorazione");
    
    uint[] memory tokens = new uint[](counterProdotto.current());
    uint j = 0;
    uint s = 0;
    uint dim = 0;
    for (uint i = 1; i <= counterProdotto.current(); i++)  {           
            if (keccak256(abi.encodePacked((listaProdotti[i].nomeProdotto))) == keccak256(abi.encodePacked((name)))) {
                tokens[j] = i; 
                j++; 
            }
        }
    
    for(uint k=0; k < j; k++){
        if (_exists(generaToken(tokens[k],"2"))) {
             
                if (ownerOf(generaToken(tokens[k],"2")) == msg.sender){
                dim++;                   
            }
        }
        
    }
    
    Prodotto[] memory _prodotti= new Prodotto[](dim);
    
    for (uint k = 0; k < j; k++){
        if (_exists(generaToken(tokens[k],"2"))) {           
            if (ownerOf(generaToken(tokens[k],"2")) == msg.sender){
                _prodotti[s] = listaProdotti[tokens[k]];
                s++; 
            }                          
        }
    }
    return _prodotti;
    

    }

    function searchCarbonFootprint(string memory name, string memory scelta) public view returns(Prodotto[] memory){
    require((msg.sender == produttore) || (msg.sender == consumatore), "Solo il produttore e il consumatore possono cercare prodotti associati a carbon footprint");
   
    uint[] memory tokens = new uint[](counterCarbonFootprint.current());
    uint j = 0;
    uint s = 0;
    uint dim = 0;
    for (uint i = 1; i <= counterCarbonFootprint.current(); i++)  {          
            if (keccak256(abi.encodePacked((listaCarbonFootprint[i].nomeProdotto))) == keccak256(abi.encodePacked((name)))) {
                tokens[j] = i; 
                j++; 
            }
        }
    
    for(uint k=0; k < j; k++){
        if (_exists(generaToken(tokens[k],"3"))) {
            if (keccak256(abi.encodePacked(("Acquisto"))) == keccak256(abi.encodePacked((scelta)))){
                require(msg.sender == consumatore, "Solo il consumatore puo' acquistare prodotti associati a carbonfootprint");
                if (((ownerOf(generaToken(tokens[k],"3")) == produttore))){                       
                    dim++;    
                } 
            } else if (keccak256(abi.encodePacked(("Posseduti"))) == keccak256(abi.encodePacked((scelta)))){
                if (((ownerOf(generaToken(tokens[k],"3")) == msg.sender))){
                dim++; 
                }   
            }
        }       
    }
    
    Prodotto[] memory _prodotti= new Prodotto[](dim);
    
    for (uint k = 0; k < j; k++){
        if (_exists(generaToken(tokens[k],"3"))) {
            if (keccak256(abi.encodePacked(("Acquisto"))) == keccak256(abi.encodePacked((scelta)))){
                require(msg.sender == consumatore, "Solo il consumatore puo' acquistare prodotti");
                if (ownerOf(generaToken(tokens[k],"3")) == produttore){
                    _prodotti[s] = listaCarbonFootprint[tokens[k]];
                    s++;    
                } 
            } else if (keccak256(abi.encodePacked(("Posseduti"))) == keccak256(abi.encodePacked((scelta)))){
                if (ownerOf(generaToken(tokens[k],"3")) == msg.sender){
                _prodotti[s] = listaCarbonFootprint[tokens[k]];
                s++; 
                }   
            } 
            
        }
    }
    return _prodotti;
    

    }

    function searchTutteMateriePrimePossedute() public view returns(MateriaPrima[] memory){
        require((msg.sender == produttore) || (msg.sender == fornitore), "Solo il fornitore e il produttore possono cercare le materie prime");
        
        uint[] memory tokens = new uint[](counterMateriaPrima.current());
        uint j = 0;
        uint s = 0;
        uint dim = 0;
        for (uint i = 1; i <= counterMateriaPrima.current(); i++)  {
           
            tokens[j] = i; 
            j++; 
        }

        for(uint k=0; k < j; k++){
            if (_exists(generaToken(tokens[k],"1"))) { 
                if (ownerOf(generaToken(tokens[k],"1")) == msg.sender){
                    dim++; 
                }   
            }
        }
        
        MateriaPrima[] memory _materiePrime = new MateriaPrima[](dim);
        
        for (uint k = 0; k < j; k++){
            if (_exists(generaToken(tokens[k],"1"))) {
                if (((ownerOf(generaToken(tokens[k],"1")) == msg.sender))){
                _materiePrime[s] = listaMateriePrime[tokens[k]];
                s++; 
                }   
            }
        }
        return _materiePrime;
       

    }

    function searchTuttiProdottiPosseduti(string memory tipo) public view returns(Prodotto[] memory){
        
        uint contatore = 0;
        string memory flag = "";
        if (keccak256(abi.encodePacked("Prodotto")) == keccak256(abi.encodePacked(tipo))){
            contatore = counterProdotto.current();
            flag = "2";
        } else if (keccak256(abi.encodePacked("Carbon Footprint")) == keccak256(abi.encodePacked(tipo))){
            contatore = counterCarbonFootprint.current();
            flag = "3";
        } 
        uint[] memory tokens = new uint[](contatore);
        uint j = 0;
        uint s = 0;
        uint dim = 0;
        for (uint i = 1; i <= contatore; i++)  {
            
            tokens[j] = i; 
            j++; 
        }

        for(uint k=0; k < j; k++){
            if (_exists(generaToken(tokens[k],flag))) { 
                if (ownerOf(generaToken(tokens[k],flag)) == msg.sender){
                    dim++; 
                }   
            }
        }
        
        Prodotto[] memory _prodotti = new Prodotto[](dim);
        
        for (uint k = 0; k < j; k++){
            if (_exists(generaToken(tokens[k],flag))) {
                if (ownerOf(generaToken(tokens[k],flag)) == msg.sender){
                     if (keccak256(abi.encodePacked(flag)) == keccak256(abi.encodePacked("2"))){
                        _prodotti[s] = listaProdotti[tokens[k]];
                     } else if (keccak256(abi.encodePacked(flag)) == keccak256(abi.encodePacked("3"))){
                         _prodotti[s] = listaCarbonFootprint[tokens[k]];
                     }
                
                s++; 
                }   
            }
        }
        return _prodotti;
        

    }

     function generaToken(uint count, string memory tipo) public pure returns(uint) {
        uint  val=0;
        string memory id = Strings.toString(count);
        id = string(abi.encodePacked(tipo, id));
        bytes   memory stringBytes = bytes(id);
        for (uint  i =  0; i<stringBytes.length; i++) {
            uint exp = stringBytes.length - i;
            bytes1 ival = stringBytes[i];
            uint8 uval = uint8(ival);
           uint jval = uval - uint(0x30);
   
           val +=  (uint(jval) * (10**(exp-1))); 
        }
      return val;
    }

    function getTask(string memory _nome,string memory _lotto, string memory tipo) public view returns(Task[] memory tasks){
        uint IDToken = 0;
        uint index = 0;
        
        if (keccak256(abi.encodePacked("Materia Prima")) == keccak256(abi.encodePacked(tipo))){
            index = searchIndexMP(_nome, _lotto);
            IDToken = generaToken(index, "1");                     
        } else if(keccak256(abi.encodePacked("Prodotto")) == keccak256(abi.encodePacked(tipo))){
            index = searchIndexProdotto(_nome, _lotto);
            IDToken = generaToken(index, "2");           
        } 

        if (IDToken != 0){
            return listaTask[IDToken];
        }

             
        
    }
   
}