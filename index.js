const express =  require('express');
const app = express();
const bodyParser = require('body-parser')

const path = require('path')

const port = process.env.PORT || 3000

//importando sqlite
const sqlite = require('sqlite')
const dbConnection = sqlite.open(path.resolve(__dirname, 'banco.sqlite'), {Promise})

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true }))

app.get('/', async (request, response) => {
    //response.send('<h1>Olá FullStack Lab</h1>')
    const db = await dbConnection;
    const categoriasDb = await db.all('select * from categorias')
    const vagas = await db.all('select * from vagas')
    const categorias = categoriasDb.map(cat => {
        return {
            ...cat,
            vagas: vagas.filter(vaga => vaga.categoria === cat.id)
        }
    })
    response.render('home', {
        categorias: categorias,
        //vagas: vagas
    });
})

app.get('/admin', (request, response) => {
    response.render('admin/home')
})

app.get('/admin/vagas', async (request, response) => {
    const db = await dbConnection
    const vagas = await db.all('select * from vagas')
    response.render('admin/vagas', {
        vagas: vagas
    })
})

app.get('/admin/vagas/delete/:id', async (request, response) => {
    const db = await dbConnection
    await db.run('delete from vagas where id = '+request.params.id);
    response.redirect('/admin/vagas')
})

app.get('/admin/vagas/nova', async (request, response) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    response.render('admin/nova-vaga', {
        categorias: categorias
    })
})

app.get('/admin/vagas/editar/:id', async (request, response) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    const vaga = await db.get('select * from vagas where id = '+ request.params.id)
    response.render('admin/editar-vaga', {
        categorias: categorias,
        vaga: vaga
    })
})

app.post('/admin/vagas/editar/:id', async(request, response) => {
    const db = await dbConnection
    const { titulo, descricao, categoria} = request.body
    const { id } = request.params
    await db.run(`update vagas set categoria = '${categoria}', titulo = '${titulo}', descricao = '${descricao}' where id = ${ id }`)
    response.redirect('/admin/vagas')
})

app.post('/admin/vagas/nova', async(request, response) => {
    const db = await dbConnection
    const { titulo, descricao, categoria} = request.body
    await db.run(`INSERT INTO vagas(categoria, titulo, descricao) VALUES( '${categoria}','${titulo}', '${descricao}')`)
    response.redirect('/admin/vagas')
})

app.get('/vaga/:id', async (request, response) => {
    //response.send('<h1>Olá FullStack Lab</h1>')
    const db = await dbConnection
    const vaga = await db.get('select * from vagas where id =' +request.params.id)
    response.render('vaga', {
        vaga
    }); 
})

const init = async() => {
    const db = await dbConnection

   // await db.run('DROP TABLE vagas')
   // await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);')
   // const categoria = 'Marketing team'
   // await db.run(`INSERT INTO categorias(categoria) VALUES('${categoria}')`)

   // await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);')
   // const vaga = 'Social Media (São Francisco)'
   // const descricao = 'Vaga para para fullstack developer que fez o curso DevPleno'
   // await db.run(`INSERT INTO vagas(categoria, titulo, descricao) VALUES(2,'${vaga}', '${descricao}')`)
}
init()
app.listen(port, (err) => {
    if(err){
        console.log('Erro ao iniciar o servidos')
    }else{
        console.log('Servidor Jobify rodando...')
    }
})