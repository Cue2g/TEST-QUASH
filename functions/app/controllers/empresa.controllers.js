const Joi            = require('@hapi/joi');
const funtionHelprs  = require('../helpers/functionsHelpers')
const admin          = require('firebase-admin');
const db             = admin.firestore()
const collectionName = 'empresa';


const schemaEmpresa = Joi.object({
    codeRif   : Joi.string().min(5).max(10).required(),
    name      : Joi.string().min(5).max(40).required(),
    country   : Joi.string().min(2).max(15).required(),
    state     : Joi.string().min(2).max(50).required(),
    address   : Joi.string().min(2).max(150).required(),
    telefono  : Joi.string().min(2).max(40).required(),
    email     : Joi.string().min(2).max(25)
  })

exports.postEmpresa = async function ( req, res) 
{   
    const { error } = schemaEmpresa.validate(req.body);

    if (error){
        return res.status(400).json({
          error :  true,
          msg   :  error.details[0].message
        })
    }

    const docs = await funtionHelprs.search(collectionName);

    if(!docs){
        return res.status(400).json({
            error :  true,
            msg   :  'Error en la validacion de la empresa'
          })
    }

    const response = docs.map((doc) => (doc.data().codeRif));
    const validar = response.some((elem) => elem === req.body.codeRif);

    if (validar){
        return res.status(400).json({
            estatus : 'error',
            msg     : 'la empresa ya existe'
        })
    }
    
    try 
    {
        await db.collection('empresa')
            .doc()
            .create(createEmpresa(req.body))
        return res.status(200).json(
            {
                status        : "success",
                description   : "Empresa Creada de forma satisfactoria",
                data          : [createEmpresa(req.body)] 
           }
        );
    } 
    catch (error) 
    {
        return res.status(500).json({
            status      : "error",
            requestTime : today,
            description : error
            })
    }
}

exports.getEmpresa = async function (req, res){

    try {

        const today = new Date().toLocaleString()
        const docs = await funtionHelprs.search(collectionName);
        const response = docs.map(doc => ({
        id        : doc.id,
        codeRif   : doc.data().codeRif,
        name      : doc.data().name,
        country   : doc.data().country,
        state     : doc.data().state,
        address   : doc.data().address,
        telefono  : doc.data().telefono,
        email     : doc.data().email,
        fechaReg  : doc.data().fechaReg 
    }))

    return res.status(200).json({
        "status": "success",
        "requestTime": today,
        "results": response.length,
        "data": response
        })
            
    } catch (error) {
        return res.status(500).json({
            "status"     : "error",
            "requestTime": today,
            "description": error
            })
    }
}

exports.deleteEmpresa = async function (req, res ){
    const key =  req.params.empresa_code;

    const docs = await funtionHelprs.search(collectionName);
    if(!docs){
        return res.status(400).json({
            error :  true,
            msg   :  'Error en la validacion de la empresa'
          })
    }

    const docResponse = docs.map(doc => ({
        id        : doc.id,
        codeRif   : doc.data().codeRif
    }))
    const buscar = docResponse.find((elem) => elem.codeRif === key);
    if(!buscar) {
        res.status(404).json({
            error :  true,
            msg   :  'No se encontro la empresa'
          })
    }

    const id = buscar.id;
    const response = await funtionHelprs.delete(collectionName, id);

    if(response.status === 'success'){
        return res.status(200).json(response)
    }else{
        return res.status(500).json(response)
    }
}

exports.putEmpresa = async function (req, res ){
    const key =  req.params.empresa_code;
    const docs = await funtionHelprs.search(collectionName);
    
    if(!docs){
        return res.status(400).json({
            error :  true,
            msg   :  'Error en la validacion de la empresa'
          })
    }

    const docResponse = docs.map(doc => ({
        id        : doc.id,
        codeRif   : doc.data().codeRif
    }))

    const buscar = docResponse.find((elem) => elem.codeRif === key);

    if(!buscar) {
        res.status(404).json({
            error :  true,
            msg   :  'No se encontro la empresa'
          })
    }

    const id = buscar.id;

    const data = createJson(req.body)
    
    if(!data){
       return res.status(400).json({
           error: true,
           msg: 'Los campos enviados no coiciden con la coleccion o estan vacios'
       })
    }


    const response = await funtionHelprs.update(collectionName, id, data);

    return res.status(200).json(response)
    
}


////funciones 
function createEmpresa(body) {

    const data = {
        codeRif   : body.codeRif,
        name      : body.name,
        country   : body.country,
        state     : body.state,
        address   : body.address,
        telefono  : body.telefono,
        email     : body.email,
        fechaReg  : Date.now()
    }
    return data
}

function createJson(data) {
    const json = {};

    if(data.name){
        json.name = data.name
    }

    if(data.country){
        json.country = data.country
    }

    if(data.state){
        json.state = data.state
    }

    if(data.address){
        json.address = data.address
    }

    if(data.telefono){
        json.telefono = data.telefono
    }


    if(Object.keys(json).length === 0){
        return
    }else{
        return json
    }
}

