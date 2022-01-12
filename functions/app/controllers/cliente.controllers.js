const Joi            = require('@hapi/joi');
const funtionHelprs  = require('../helpers/functionsHelpers')
const admin          = require('firebase-admin');
const { result } = require('@hapi/joi/lib/base');
const db             = admin.firestore()
const collectionName = 'cliente';

const schemaCliente = Joi.object({
    dni       : Joi.string().min(5).max(10).required(),
    name      : Joi.string().min(5).max(40).required(),
    country   : Joi.string().min(2).max(15).required(),
    state     : Joi.string().min(2).max(15).required(),
    address   : Joi.string().min(2).max(150).required(),
    telefono  : Joi.string().min(2).max(40).required(),
    email     : Joi.string().min(2).max(50)
})

const schemaTours = Joi.object({
    tours : Joi.array().required()
})

exports.postCliente = async function ( req, res)
{
    const { error } = schemaCliente.validate(req.body);

    if (error){
        return res.status(400).json({
          error :  true,
          msg   :  error.details[0].message
        });
    }

    const docs = await funtionHelprs.search(collectionName);

    if(!docs){
        return res.status(400).json({
            error :  true,
            msg   :  'Error en la validacion de la empresa'
          })
    }

    const response = docs.map((doc) => (doc.data().dni));
    const validar = response.some((elem) => elem === req.body.dni);

    if (validar){
        return res.status(400).json({
            estatus : 'error',
            msg     : 'el usuario ya esta registrado'
        })
    }

    try
    {
        await db.collection(collectionName)
            .doc()
            .create(createCliente(req.body))
        return res.status(200).json(
            {
                status        : "success",
                description   : "Se a guardado el cliente",
                data          : [createCliente(req.body)]
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

exports.getCliente = async function (req, res){

    try {

        const today = new Date().toLocaleString();
        const docs = await funtionHelprs.search(collectionName);
        const response = docs.map(doc => ({
        id        : doc.id,
        dni       : doc.data().dni,
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

exports.deleteCliente = async function (req, res ){
    const key =  req.params.cliente_code;

    const docs = await funtionHelprs.search(collectionName);
    if(!docs){
        return res.status(400).json({
            error :  true,
            msg   :  'Error en la validacion del cliente'
          })
    }

    const docResponse = docs.map(doc => ({
        id        : doc.id,
        dni  : doc.data().dni
    }))

    const buscar = docResponse.find((elem) => elem.dni === key);
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

exports.putCliente = async function (req, res ){
    const key =  req.params.cliente_code;
    const docs = await funtionHelprs.search(collectionName);


    if(!docs){
        return res.status(400).json({
            error :  true,
            msg   :  'Error en la validacion del cliente'
          })
    }

    const docResponse = docs.map(doc => ({
        id    : doc.id,
        dni   : doc.data().dni
    }))
    const buscar = docResponse.find((elem) => elem.dni === key);
    if(!buscar) {
        res.status(404).json({
            error :  true,
            msg   :  'No se encontro el cliente'
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


exports.addTour = async function (req, res ){

    const { error } = schemaTours.validate(req.body);

    if (error){
        return res.status(400).json({
          error :  true,
          msg   :  error.details[0].message
        })
    }

    const key =  req.params.cliente_code;
    const docs = await funtionHelprs.search(collectionName);
    const toursBA = req.body.tours;
    if(!docs){
        return res.status(400).json({
            error :  true,
            msg   :  'Error en la validacion del cliente'
          })
    }

    const docResponse = docs.map(doc => ({
        id    : doc.id,
        dni   : doc.data().dni,
        tours : doc.data().tours
    }))
    const buscar = docResponse.find((elem) => elem.dni === key);

    if(!buscar) {
        res.status(404).json({
            error :  true,
            msg   :  'No se encontro el cliente'
          })
    }

    const docsTour = await funtionHelprs.search('tour');
    if(!docsTour){
        return res.status(400).json({
            error :  true,
            msg   :  'Error en la validacion del tour'
          })
    }
    const docResTour = docsTour.map(doc => (doc.id))
    const arraytoursPermitidos = []
    toursBA.forEach(elem => {
        let search = docResTour.find((elem2) => elem2 === elem);
        if(search){
            arraytoursPermitidos.push(search)
        }
    });



    if(arraytoursPermitidos.length === 0){
        return res.status(400).json({
            error :  true,
            msg   :  'Ningung tour introducido esta registrado'
          })
    }

    const arrayHelper = arraytoursPermitidos.concat(buscar.tours);

    let resultArray = arrayHelper.filter((item,index)=>{
        return arrayHelper.indexOf(item) === index;
    })


    const id = buscar.id;

    const response = await funtionHelprs.update(collectionName, id, {tours:resultArray});

    return res.status(200).json(response)


}

exports.deleteTour= async function (req, res ){
    const key =  req.params.cliente_code;
    const docs = await funtionHelprs.search(collectionName);
    const tourBA = req.body.tour;
    if(!docs){
        return res.status(400).json({
            error :  true,
            msg   :  'Error en la validacion del cliente'
          })
    }

    const docResponse = docs.map(doc => ({
        id    : doc.id,
        dni   : doc.data().dni,
        tours : doc.data().tours
    }))
    const buscar = docResponse.find((elem) => elem.dni === key);

    if(!buscar) {
        return res.status(404).json({
            error :  true,
            msg   :  'No se encontro el cliente'
          })
    }


    var resultArray = removeItemFromArr(buscar.tours,tourBA)



    const id = buscar.id;

    const response = await funtionHelprs.update(collectionName, id, {tours:resultArray});

    return res.status(200).json(response)

}

exports.getClienteID = async function (req, res ){
         const today = new Date().toLocaleString()
    try {

        const key =  req.params.cliente_code;

        let Ref = db.collection('cliente');
        let query = await Ref.where('dni', '==', key).get()
        let docs  = query.docs;

        if(docs.length === 0){
            res.status(404).json({
                error :  true,
                msg   :  'No se encontro el cliente'
              })
        }

        const response = docs.map(doc => ({
        id        : doc.id,
        dni       : doc.data().dni,
        name      : doc.data().name,
        country   : doc.data().country,
        state     : doc.data().state,
        address   : doc.data().address,
        telefono  : doc.data().telefono,
        email     : doc.data().email,
        fechaReg  : doc.data().fechaReg,
        tours     : doc.data().tours
        }))

        const toursC = response[0].tours

        const docsT = await funtionHelprs.search('tour');

        if(!docsT){
        return res.status(400).json({
            error :  true,
            msg   :  'Error en la validacion del tour'
          })
        }

        const docResponseT = docsT.map(doc => ({
        id              : doc.id,
        codeRif         :  doc.data().codeRif,
        name            :  doc.data().name,
        duration        :  doc.data().duration,
        maxGroupSize    :  doc.data().maxGroupSize,
        difficulty      :  doc.data().difficulty,
        ratingsAverage  :  doc.data().ratingsAverage,
        ratingsQuantity :  doc.data().ratingsQuantity,
        price           :  doc.data().price,
        summary         :  doc.data().summary,
        description     :  doc.data().description,
        createdAt       :  doc.data().createdAt,
        startDate       :  doc.data().startDate,
        startLocation   :   doc.data().startLocation
        }))


        const resultTour = toursC.map( (tourR) => {
            let buscar = docResponseT.find((elem) => elem.id === tourR);
            return buscar
        })

        response[0].tours = resultTour

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


function createCliente(body) {

    const data = {
        dni       : body.dni,
        name      : body.name,
        country   : body.country,
        state     : body.state,
        address   : body.address,
        telefono  : body.telefono,
        email     : body.email,
        fechaReg  : Date.now(),
        tours:[]
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

function removeItemFromArr( arr, item ) {
    return arr.filter( function( e ) {
        return e !== item;
    } );
};
