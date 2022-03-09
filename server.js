var express = require('express'); // requisita a biblioteca para a criacao dos serviços web.
 var pg = require("pg"); // requisita a biblioteca pg para a comunicacao com o banco de dados.

 var sw = express(); // iniciliaza uma variavel chamada app que possitilitará a criação dos serviços e rotas.

 sw.use(express.json());//padrao de mensagens em json.

 sw.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET,POST');
    next();
});

const config = {
    host: 'localhost',
    user: 'postgres',
    database: 'db_cs_lpbd_2021_2',
    password: 'postgres',
    port: 5432
};

//definia conexao com o banco de dados.
const postgres = new pg.Pool(config);


//definicao do primeiro serviço web.
sw.get('/', (req, res) => {
    res.send('Hello, world! meu primeiro teste.  #####');
})


sw.get('/listjogador', function (req, res) {

    //estabelece uma conexão com o banco de dados
    postgres.connect(function(err,client,done) {

       if(err){

           console.log("Não conseguiu acessar o BD :"+ err);
           res.status(400).send('{'+err+'}');
       }else{
        client.query('select j.nickname, j.senha, j.quantpontos, j.quantdinheiro, to_char(j.datacadastro, \'yyyy/mm/dd\') as data_cadastro, to_char(j.data_ultimo_login, \'yyyy/mm/dd\') as data_ultimo_login, j.situacao, e.cep, e.complemento, e.codigo from tb_jogador j left join tb_endereco e on (j.nickname=e.nicknamejogador) order by j.datacadastro asc;',function(err,result) {        
                done(); // closing the connection;
                if(err){
                    console.log(err);
                    res.status(400).send('{'+err+'}');
                }else{
                    res.status(200).send(result.rows);
                }
                
            });
       } 
    });
});

sw.get('/deletejogador/:nickname', (req, res) => {

    postgres.connect(function(err,client,done) {
        if(err){
            console.log("Não conseguiu acessar o banco de dados!"+ err);
            res.status(400).send('{'+err+'}');
        }else{

            var q1 ={
                text: 'delete FROM tb_endereco where nicknamejogador = $1',
                values: [req.params.nickname]
            }
            
            var q2 ={
                text: 'delete FROM tb_jogador where nickname = $1',
                values: [req.params.nickname]
            }
    
            client.query( q1 , function(err,result) {
                //done(); // closing the connection;
                if(err){
                    console.log(err);
                    res.status(400).send('{'+err+'}');
                }else{
                    client.query( q2 , function(err,result) {
                        done(); // closing the connection;
                        if(err){
                            console.log(err);
                            res.status(400).send('{'+err+'}');
                        }else{
                            res.status(200).send({'nickname': req.params.nickname});//retorna o nickname deletado.
                        }                    
                    })
                }
            });
        } 
     });
});

sw.post('/insertjogador', function (req, res, next) {
    
    postgres.connect(function(err,client,done) {

       if(err){

           console.log("Nao conseguiu acessar o  BD "+ err);
           res.status(400).send('{'+err+'}');
       }else{            

            var q1 ={
                text: 'insert into tb_jogador (nickname, senha, quantpontos, quantdinheiro, datacadastro, situacao) values ($1, $2, $3, $4, now(), $5)',
                values: [req.body.nickname,
                         req.body.senha,
                         req.body.quantpontos,
                         req.body.quantdinheiro,
                         req.body.situacao]
            }

            var q2 ={
                text: 'insert into tb_endereco (complemento, cep, nicknamejogador) values ($1, $2, $3)',
                values: [req.body.endereco.complemento,
                         req.body.endereco.cep,
                         req.body.nickname]
            }
            console.log(q1)
    
            client.query(q1,function(err,result) {
                if(err){
                    console.log('retornou 400 no insert');
                    res.status(400).send('{'+err+'}');
                }else{
                    client.query(q1,function(err,result) {
                        if(err){
                            console.log('retornou 400 no insert');
                            res.status(400).send('{'+err+'}');
                        }else{
                            done(); // closing the connection;
                            console.log('retornou 201 no insert');
                            res.status(201).send(req.body.nickname);//se não realizar o send nao finaliza o client
                        }
                    });
                }           
            });
       }       
    });
});


sw.get('/listmodo', function (req, res) {

    //estabelece uma conexão com o banco de dados
    postgres.connect(function(err,client,done) {

       if(err){

           console.log("Não conseguiu acessar o BD :"+ err);
           res.status(400).send('{'+err+'}');
       }else{
        client.query('select codigo, nome, to_char(datacriacao, \'yyyy-mm-dd\') as datacriacao, quantboots, quantrounds from tb_modo order by datacriacao asc;',function(err,result) {        
                done(); // closing the connection;
                if(err){
                    console.log(err);
                    res.status(400).send('{'+err+'}');
                }else{
                    res.status(200).send(result.rows);
                }
                
            });
       } 
    });
});


//cria o serviço web, no modo web para inserir registros da tabela tb_modo
sw.post('/insertmodo', function (req, res, next) {
    
    postgres.connect(function(err,client,done) {

       if(err){

           console.log("Nao conseguiu acessar o  BD "+ err);
           res.status(400).send('{'+err+'}');
       }else{            

            var q ={
                //insert into tb_modo (nome, datacriacao, quantboots, quantrounds) values ('TESTE', now(), 8, 20);
                text: 'insert into tb_modo (nome, datacriacao, quantboots, quantrounds) values ($1, now(), $2, $3) returning codigo',
                values: [req.body.nome, req.body.quantboots, req.body.quantrounds]
            }
            console.log(q);
    
            client.query(q,function(err,result) {
                done(); // closing the connection;
                if(err){
                    console.log('retornou 400 no insert');
                    console.log(err);
                    console.log(err.data);
                    res.status(400).send('{'+err+'}');
                }else{

                    console.log('retornou 201 no insert');
                    res.status(201).send(result.rows[0]);//se não realizar o send nao finaliza o client
                }           
            });
       }       
    });
});

//cria o serviço web, no modo web para atualizar registros da tabela tb_modo
sw.post('/updatemodo/', (req, res) => {

    postgres.connect(function(err,client,done) {
        if(err){

            console.log("Não conseguiu acessar o BD: "+ err);
            res.status(400).send('{'+err+'}');

        }else{

            var q ={
                //update tb_modo set nome = '', quantboots = 0, quantrounds = 0 where codigo = 4
                text: 'update tb_modo set nome = $1, quantboots = $2, quantrounds = $3 where codigo = $4',
                values: [req.body.nome, req.body.quantboots, req.body.quantrounds, req.body.codigo]
            }
            console.log(q);
     
            client.query(q,function(err,result) {
                done(); // closing the connection;
                if(err){
                    console.log("Erro no updatemodo: "+err);
                    res.status(400).send('{'+err+'}');
                }else{             
                    res.status(200).send(req.body);//se não realizar o send nao finaliza o client nao finaliza
                }
            });
        }
     });
});

sw.get('/deletemodo/:codigo', (req, res) => {

    postgres.connect(function(err,client,done) {
        if(err){
            console.log("Não conseguiu acessar o banco de dados"+ err);
            res.status(400).send('{'+err+'}');
        }else{
            
            var q ={
                text: 'delete FROM tb_modo where codigo = $1',
                values: [req.params.codigo]
            }
    
            client.query( q , function(err,result) {
                done(); // closing the connection;
                if(err){
                    console.log(err);
                    res.status(400).send('{'+err+'}');
                }else{
                    res.status(200).send({'codigo': req.params.codigo});//retorna o codigo deletado.
                }

            });
        } 
     });

});

//cria o serviço web, no modo web para listar os registros da tabela tb_local
sw.get('/listlocal', function (req, res) {
    //estabelece uma conexão com o banco de dados
    postgres.connect(function(err,client,done) {

        if(err){

            console.log("Não conseguiu acessar o BD :"+ err);
            res.status(400).send('{'+err+'}');
        }else{
        client.query('select codigo, nome, statuslocal from tb_local order by codigo asc;',function(err,result) {        
                done(); // closing the connection;
                if(err){
                    console.log(err);
                    res.status(400).send('{'+err+'}');
                }else{
                    res.status(200).send(result.rows);
                }
                
            });
        } 
    });
});

//cria o serviço web, no modo web para inserir registros da tabela tb_modo
sw.post('/insertlocal', function (req, res, next) {
    
    postgres.connect(function(err,client,done) {

       if(err){

           console.log("Nao conseguiu acessar o  BD "+ err);
           res.status(400).send('{'+err+'}');
       }else{            

            var q ={
                //insert into tb_loca (nome, statuslocal) values ('claison', true);
                text: 'insert into tb_local (nome, statuslocal) values ($1, $2) returning codigo',
                values: [req.body.nome, req.body.statuslocal]
            }
            console.log(q);
    
            client.query(q,function(err,result) {
                done(); // closing the connection;
                if(err){
                    console.log('retornou 400 no insert');
                    console.log(err);
                    console.log(err.data);
                    res.status(400).send('{'+err+'}');
                }else{

                    console.log('retornou 201 no insert');
                    res.status(201).send(result.rows[0]);//se não realizar o send nao finaliza o client
                }           
            });
       }       
    });
});

sw.post('/updatelocal/', (req, res) => {

    postgres.connect(function(err,client,done) {
        if(err){

            console.log("Não conseguiu acessar o BD: "+ err);
            res.status(400).send('{'+err+'}');

        }else{

            var q ={
                //update tb_local set nome = '', quantboots = 0, quantrounds = 0 where codigo = 4
                text: 'update tb_local set nome = $1, statuslocal = $2 where codigo = $3',
                values: [req.body.nome, req.body.statuslocal, req.body.codigo]
            }
            console.log(q);
     
            client.query(q,function(err,result) {
                done(); // closing the connection;
                if(err){
                    console.log("Erro no updatelocal: "+err);
                    res.status(400).send('{'+err+'}');
                }else{             
                    res.status(200).send(req.body);//se não realizar o send nao finaliza o client nao finaliza
                }
            });
        }
     });
});

sw.get('/deletelocal/:codigo', (req, res) => {

    postgres.connect(function(err,client,done) {
        if(err){
            console.log("Não conseguiu acessar o banco de dados"+ err);
            res.status(400).send('{'+err+'}');
        }else{
            
            var q ={
                text: 'delete FROM tb_local where codigo = $1',
                values: [req.params.codigo]
            }
    
            client.query( q , function(err,result) {
                done(); // closing the connection;
                if(err){
                    console.log(err);
                    res.status(400).send('{'+err+'}');
                }else{
                    res.status(200).send({'codigo': req.params.codigo});//retorna o codigo deletado.
                }

            });
        } 
     });

});


sw.listen(4000, function () {
    console.log('Server is running.. on Port 4000');
});