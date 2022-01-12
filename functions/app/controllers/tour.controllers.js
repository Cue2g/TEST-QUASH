const Joi            = require("@hapi/joi");
const funtionHelprs  = require("../helpers/functionsHelpers")
const admin          = require("firebase-admin");
const db             = admin.firestore()
const collectionName = "tour";

const schemaTour = Joi.object({
    codeRif : Joi.string().min(5).max(10).required(),
    name : Joi.string().min(10).max(40,).required(),
    duration : Joi.number().required(),
    maxGroupSize : Joi.number().required(),
    difficulty : Joi.string().valid("easy","medium", "difficult").required(),
    ratingsAverage : Joi.number().min(1).max(5).default(4.5).required(),
    ratingsQuantity : Joi.number().default(0),
    price : Joi.number().required(),
    summary : Joi.string().trim().required(),
    description : Joi.string().trim(),
    createdAt : Joi.date().default(Date.now()),
    startDate : Joi.date(),
    startLocation : Joi.string()
})

const schemaTourEdit = Joi.object({
    codeRif         : Joi.string().min(5).max(10),
    name            : Joi.string().min(10).max(40,),
    duration        : Joi.number(),
    maxGroupSize    : Joi.number(),
    difficulty      : Joi.string().valid("easy","medium", "difficult"),
    ratingsAverage  : Joi.number().min(1).max(5).default(4.5),
    ratingsQuantity : Joi.number().default(0),
    price           : Joi.number(),
    summary         : Joi.string().trim(),
    description     : Joi.string().trim(),
    createdAt       : Joi.date().default(Date.now()),
    startDate       : Joi.date(),
    startLocation   : Joi.date()
})

const schemaTourD = Joi.object({
    difficulty : Joi.array().required()
})

exports.postTour= async function ( req, res) {
    const today = new Date().toLocaleString()
    const docs = await funtionHelprs.search("empresa");
    const response = docs.map((doc) => (doc.data().codeRif));
    const validar = response.some((elem) => elem === req.params.tour_code);

    if (!validar){
        return res.status(400).json({
            estatus : "error",
            msg     : "La empresa no existe"
        })
    }

    req.body.codeRif = req.params.tour_code;

    const { error } = schemaTour.validate(req.body);

    if (error){
        return res.status(400).json({
          error :  true,
          msg   :  error.details[0].message
        })
    }
    try {
        await db.collection(collectionName)
            .doc()
            .create(createTour(req.body))
        return res.status(200).json(
            {
                status        : "success",
                description   : "El  tour creado de forma satisfactoria",
                data          : [createTour(req.body)]
           }
        )
    }
    catch (err)
    {
        return res.status(500).json({
            status      : "error",
            requestTime : today,
            description : err
            })
    }
}

exports.getTour = async function (req, res){
    const today = new Date().toLocaleString()
    try {

        const docs = await funtionHelprs.search(collectionName);
        const response = docs.map(doc => ({
                id              : doc.id,
                codeRif         : doc.data().codeRif,
                name            : doc.data().name,
                duration        : doc.data().duration,
                maxGroupSize    : doc.data().maxGroupSize,
                difficulty      : doc.data().difficulty,
                ratingsAverage  : doc.data().ratingsAverage,
                ratingsQuantity : doc.data().ratingsQuantity,
                price           : doc.data().price,
                summary         : doc.data().summary,
                description     : doc.data().description,
                createdAt       : doc.data().createdAt,
                startDate       : stringTime(doc.data().startDate),
                startLocation   : doc.data().startLocation
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

exports.deleteTour = async function (req, res ){
    const key =  req.params.tour_code;
    const docs = await funtionHelprs.search(collectionName);

    if(!docs){
        return res.status(400).json({
            error :  true,
            msg   :  "Error en la validacion del tour"
          })
    }

    const docResponse = docs.map(doc => ({
        id        : doc.id,
    }))

    const buscar = docResponse.find((elem) => elem.id === key);

    if(!buscar) {
        res.status(404).json({
            error :  true,
            msg   :  "No se encontro el tour"
          })
    }

    const id = key;

    const response = await funtionHelprs.delete(collectionName, id);

    if(response.status === "success"){
        return res.status(200).json(response)
    }else{
        return res.status(500).json(response)
    }
}

exports.putTour = async function (req, res ){
    const key =  req.params.tour_code;

    const { error } = schemaTourEdit.validate(req.body);
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
            msg   :  "Error en la validacion del tour"
          })
    }
    const docResponse = docs.map(doc => ({
        id        : doc.id,
    }))

    const buscar = docResponse.find((elem) => elem.id === key);
    if(!buscar) {
        res.status(404).json({
            error :  true,
            msg   :  "No se encontro el tour"
          })
    }

    const docsEmpresa = await funtionHelprs.search("empresa");

    if(!docsEmpresa){
        return res.status(400).json({
            error :  true,
            msg   :  "Error en la validacion de la empresa"
          })
    }

    if(req.body.codeRif){
      const docEmpresaResponse = docsEmpresa.map(doc => (doc.data().codeRif))
      const buscarEmpresa = docEmpresaResponse.find((elem) => elem === req.body.codeRif);
      if(!buscarEmpresa) {
          res.status(404).json({
              error :  true,
              msg   :  "No se encontro la empresa"
            })
      }
    }




    const id = key;
    const data = createJson(req.body)

    if(!data){
       return res.status(400).json({
           error: true,
           msg: "Los campos enviados no coiciden con la coleccion o estan vacios"
       })
    }

    const response = await funtionHelprs.update(collectionName, id, data);

    if(response.status === "error"){
        return res.status(404).json(response)
    }

    return res.status(200).json(response)
}

exports.difficulty = async function (req, res ){

    const today = new Date().toLocaleString()
    try {

        const params =  req.body;


        const { error } = schemaTourD.validate(req.body);

        if (error){
        return res.status(400).json({
                error :  true,
                msg   :  error.details[0].message
                })
        }

        const difficulty = params.difficulty

        if(difficulty.length === 0){
            return res.status(404).json({
                error :  true,
                msg   :  "el arreglo esta vacio"
              })
        }

        if(difficulty.length > 2){
           return res.status(404).json({
                error :  true,
                msg   :  "el arreglo contiene mas informacion de la que es requerida"
              })
        }



        if(difficulty[0] !== "medium" && difficulty[0] !=="difficult"){
            return res.status(400).json({
                error :  true,
                msg   :  "el arreglo contiene informacion que no es requerida, intente con dificultades medium y difficult"
              })
        }

        if(difficulty.length === 2 ){
            if(difficulty[1] !== "medium" && difficulty[1] !=="difficult"){
                return res.status(400).json({
                    error :  true,
                    msg   :  "el arreglo contiene informacion que no es requerida, intente con dificultades medium y difficult"
                  })
            }
        }




        let Ref = db.collection(collectionName);
        let query = await Ref.where("difficulty", "in", difficulty).get()
        let docs  = query.docs;

        if(docs.length === 0){
           return res.status(404).json({
                error :  true,
                msg   :  "No se encontro el cliente"
              })
        }

        const response = docs.map(doc => ({
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
            startLocation   :  doc.data().startLocation
            }))

        let rating = 4.7;
        const responseFilterR = response.filter( (elem) => elem.ratingsAverage > rating)

        console.log(responseFilterR);
        if(responseFilterR.length === 0){
            return res.status(404).json({
                error :  true,
                msg   :  "No se encontro el ningun tour mayor a 4.7 de rating"
              })
        }


        return res.status(200).json({
            "status": "success",
            "requestTime": today,
            "results": responseFilterR.length,
            "data": responseFilterR
            })




    } catch (error) {

        return res.status(500).json({
            "status"     : "error",
            "requestTime": today,
            "description": error
            })

    }
}

exports.fecha = async function (req, res ){
  console.log('here');
  const today = new Date().toLocaleString()
  const params =  req.body;

  try {
    let startDateR = new Date(params.fecha)
    let Ref = db.collection(collectionName);
    let query = await Ref.where("startDate", "=", startDateR ).get()
    let docs  = query.docs;
    if(docs.length === 0){
       return res.status(404).json({
            error :  true,
            msg   :  "No se encontro ningun tour"
          })
    }

    const response = docs.map(doc => ({
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
        startDate       :  timeFun(doc.data().startDate),
        startLocation   :  doc.data().startLocation
        }))

        return res.status(200).json({
            "status": "success",
            "requestTime": today,
            "results": response.length,
            "data": response
            })


  } catch (e) {

    return res.status(404).json({
        "status"     : "error",
        "requestTime": today,
        "description": "no se encontro ningun tour"
        })

  }
}


exports.fechaRango = async function (req, res ){
  const today = new Date().toLocaleString()
  const params =  req.body;
  try {
    let startDateR = new Date(params.desde)
    let Ref = db.collection(collectionName);
    let query = await Ref.where("startDate", ">=", startDateR ).get()
    let docs  = query.docs;

    if(docs.length === 0){
       return res.status(404).json({
            error :  true,
            msg   :  "No se encontro ningun tour"
          })
    }

    const response = docs.map(doc => ({
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
        startDate       :  timeFun(doc.data().startDate),
        startLocation   :  doc.data().startLocation
        }))

        let hastaFecha = new Date(params.hasta)
        const responseFilterR = response.filter( (elem) => elem.startDate < hastaFecha)

        return res.status(200).json({
            "status": "success",
            "requestTime": today,
            "results": responseFilterR.length,
            "data": responseFilterR
            })


  } catch (e) {

    return res.status(500).json({
        "status"     : "error",
        "requestTime": today,
        "description": "No se encontro ningung tour"
        })

  }
}


function createTour(body) {

    const today = new Date().toLocaleString()
    let startDateR = new Date(body.startDate)
    const data = {
        codeRif         : body.codeRif,
        name            : body.name,
        duration        : body.duration,
        maxGroupSize    : body.maxGroupSize,
        difficulty      : body.difficulty,
        ratingsAverage  : body.ratingsAverage,
        price           : body.price,
        summary         : body.summary,
        description     : body.description,
        createdAt       : today,
        startDate       : startDateR,
        startLocation   : body.startLocation
    }
    return data
}

function createJson(data) {
    const json = {};

    if(data.codeRif){
        json.codeRif = data.codeRif
    }

    if(data.name){
        json.name = data.name
    }

    if(data.name){
        json.name = data.name
    }

    if(data.duration){
        json.duration = data.duration
    }

    if(data.maxGroupSize){
        json.maxGroupSize = data.maxGroupSize
    }

    if(data.difficulty){
        json.difficulty = data.difficulty
    }

    if(data.ratingsQuantity){
        json.ratingsQuantity = data.ratingsQuantity
    }

    if(data.ratingsAverage){
        json.ratingsAverage = data.ratingsAverage
    }

    if(data.price ){
        json.price  = data.price
    }

    if(data.summary ){
        json.summary  = data.summary
    }

    if(data.description ){
        json.description  = data.description
    }

    if(data.createdAt ){
        json.createdAt = data.createdAt
    }

    if(data.startDate ){
        json.startDate = data.startDate
    }

    if(data.startLocation ){
        json.startLocation = data.startLocation
    }


    if(Object.keys(json).length === 0){
        return
    }else{
        return json
    }
}

function timeFun(timestamp) {
  let date = new Date((timestamp._seconds * 1000));
  let res = date.getTime();
  return res
}

function stringTime(timestamp){
  let time = timeFun(timestamp)
  let res = new Date(time)
  return res
}
