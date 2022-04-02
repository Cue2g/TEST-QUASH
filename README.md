# TEST-QUASH
Prueba para postular para desarollador Backend Jr para quash.ai

<h2>Escenario:</h2>

Se desea llevar el control de diferentes agencias de tour, Se requiere como mínimo registrar 4 empresas de las cuales cada una debería tener asociado un mínimo de 5 tours.

 

Nota: Dos (2) es el máximo de tours a iniciar por empresas en un mes. El formato de fecha (startDate)  es 'yyyy-mm-dd' .

 

Requerimiento: 

Construir un proyecto personal en firebase, utilizar firebase/firestore y firebase/functions.
Crear un api que permita registrar datos en una collection determinada y posterior a ello manipular o consultar los registros dado un endPoint.
Para el registro de datos en la collection, los mismos se pueden realizar 1:1 por cliente o 1:N por cliente, es decir dado un cliente se puede registrar un tour y/o dado un cliente se pueden registrar en un instante dado muchos tours.
se desea obtener la consulta de todos los tours dado un cliente
Se desea obtener la consulta de un tour dado un cliente y el id del tour
Se desea actualizar los datos de un tour dado un cliente y el id del tour 
Se desea borrar por completo un tour dado un cliente  y el id del tour
Se desea borrar un campo, registro o variable de un tour  dado un cliente  y el id del tour 
Se desea obtener solo los tour dado un cliente, cuya dificultad  sea  'medium' y/o 'difficult y el 'ratingsAverage' sea mayor o igual a 4.7
Se desea obtener el nombre y la fecha de inicio del tour,  dado un cliente una fecha dada o intervalo de fecha
Todos los response con status 200 presentarlo como: 
{
"status": "success",
"requestTime": "fecha de consulta",
"createdAt": "fecha de creación del tour",
"customer": "nombreCliente",
"results": "cantidad de tours devuelto en la consulta",
"data": [{datos devueltos en la consulta}] 
}
Todos los response con status de error presentar el mensaje del error asociado 
 

Ejemplo de variables solicitadas en cada collection:
<code>
   collection Tour:
  {
      'name': 'The Sports Lover',
      'startLocation': 'California, USA',
      'startDate': '2021-05-15',
      'duration': 14,
      'maxGroupSize': 8,
      'difficulty': 'difficult',
      'ratingsAverage': 4.7,
      'ratingsQuantity': 23,
      'price': 2997,
      'summary':  'Surf, patinaje, paracaidismo, escalada en roca y más, todo en un solo tour',
      'description':  'Nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
} 
Referencia de Schema y mensajes a ser presentados en el Response 
     ({
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            maxlength: [40, 'a tour name must have less or equal then 40 characters'],
            minlength: [10, 'a tour name more have less or equal then 10 characters']            
        },
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration']
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size']
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty is either: easy, medium, difficult'
            }
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be bellow 5.0']
        },
        ratingsQuantity: {
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price']
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a description']
        },
        description: {
            type: String,
            trim: true
        },
        createdAt: {
            type: Date || timestamp,
            default: Date.now()
        },
        startDate: String,
        startLocation: String
    }
)  
</code>

Tú, tienes la libertad en ampliar el escenario planteado siempre y cuando se mantenga la información brindada como base, es decir si desea emplear nuevos endPoint o considera prudente crear nuevas colleciones para la ejecución del ejercicio del micro proyecto.
