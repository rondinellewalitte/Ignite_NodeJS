const { request, response } = require('express');
const express = require('express');

const app = express();

app.use(express.json());

/**
 * GET - Pegar uma Informação do Servidor
 * POST - Enviar e Receber uma Informação do Servidor
 * PUT - Atualizar uma Informação do Servidor
 * PATCH - Alterar uma Informação especifica do Servidor.
 * DELETE - Deletar uma Informação do Servidor
 */


/**
 * Tipos de parâmetros
 * 
 * Route Params => Indentificar um recurso editar/deletar/buscar
 * Query Params => Paginação / Filtro
 * Body Params => Os Objetos Inserção/Alteração (JSON)
*/

app.get("/courses",(request, response)=>{
    return response.json(["Curso 1","Curso 2","Curso 3"]);
});
app.post("/courses",(request, response)=>{
    return response.json(["Curso 1","Curso 2","Curso 3","Curso 4"]);
});
app.put("/courses/:id",(request, response)=>{
    const params = request.params;
    return response.json(params);
});
app.patch("/courses/:id",(request, response)=>{
    const query = request.query;
    return response.json(query);
});
app.delete("/courses/:id",(request, response)=>{
    const body = request.body;
    return response.json(body);
});

app.listen(3333);