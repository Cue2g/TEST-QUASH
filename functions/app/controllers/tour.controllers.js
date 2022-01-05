const Joi            = require('@hapi/joi');
const funtionHelprs  = require('../helpers/functionsHelpers')
const admin          = require('firebase-admin');
const db             = admin.firestore()
const collectionName = 'tours';

const schemaTour = Joi.object({
    name            : Joi.string().min(10,'a tour name more have less or equal then 10 characters').max(40,'a tour name must have less or equal then 40 characters').required('A tour must have a name'),
    duration        : Joi.number().required('A tour must have a duration'),
    maxGroupSize    : Joi.number().required(),
    difficulty      : Joi.string().valid('easy','medium', 'difficult').required('A tour must have a difficulty'),
    ratingsAverage  : Joi.number().min(1,'Rating must be above 1.0').max(5,'Rating must be bellow 5.0').default(4.5).required(),
    ratingsQuantity : Joi.number().default(0),
    price           : Joi.number().required(),
    summary         : Joi.string().trim().required('A tour must have a description'),
    description     : Joi.string().trim(),
    createdAt       : Joi.date().default(Date.now()),
    startDate       : Joi.string(),
    startLocation   : Joi.string()
  })


  exports.postTour= async function ( req, res) {   
    const { error } = schemaTour.validate(req.body);

    if (error){
        return res.status(400).json({
          error :  true,
          msg   :  error.details[0].message
        })
    }

    
    
    try 
    {
        await db.collection(collectionName)
            .doc("/" + req.body.id + "_" +req.body.code + "/")
            .create(createTour(req.body))
        return res.status(200).json(
            {
                status        : "success",
                description   : "El  tour creado de forma satisfactoria",
                data          : [createTour(req.body)] 
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


function createTour(body) {

    const data = {
        name            : body.name,
        duration        : body.duration,
        maxGroupSize    : body.maxGroupSize,
        difficulty      : body.difficulty,
        ratingsAverage  : body.ratingsAverage,
        ratingsQuantity : body.ratingsQuantity,
        price           : body.price,
        summary         : body.summary,
        description     : body.description,
        createdAt       : body.createdAt,
        startDate       : body.startDate,
        startLocation   : body.startLocation
      }
    return data
}

