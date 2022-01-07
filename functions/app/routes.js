module.exports = function (app){
    const empresa = require('./controllers/empresa.controllers')
    const tour = require('./controllers/tour.controllers')
    const cliente = require('./controllers/cliente.controllers')

    //empresa
    const urlEmpresa = '/api/empresa';
    app.route(urlEmpresa)
      .post(empresa.postEmpresa);

    app.route(urlEmpresa)
      .get(empresa.getEmpresa)

    app.route(urlEmpresa + '/:empresa_code')
      .delete(empresa.deleteEmpresa)

    app.route(urlEmpresa + '/:empresa_code')
      .put(empresa.putEmpresa)
      
    //tours 
    const urlTour = '/api/tour';

    app.route(urlTour + '/empresa=:tour_code')
      .post(tour.postTour)

    app.route(urlTour)
      .get(tour.getTour)

    app.route(urlTour + '/idTour=:tour_code')
      .delete(tour.deleteTour)

    app.route(urlTour  + '/idTour=:tour_code')
      .put(tour.putTour)

    app.route(urlTour  + '/difficulty')
      .get(tour.difficulty) 


    //clientes
    
    const urlCliente = '/api/cliente';

    app.route(urlCliente)
      .post(cliente.postCliente)

    app.route(urlCliente)
      .get(cliente.getCliente)

    app.route(urlCliente + '/byDNI=:cliente_code')
      .get(cliente.getClienteID)

    app.route(urlCliente + '/idCliente=:cliente_code')
      .delete(cliente.deleteCliente)

    app.route(urlCliente + '/idCliente=:cliente_code')
      .put(cliente.putCliente)

    app.route(urlCliente + '/addTour/idCliente=:cliente_code')
      .put(cliente.addTour)

    app.route(urlCliente + '/addTours/idCliente=:cliente_code')
      .put(cliente.addTour)
    
    app.route(urlCliente + '/deleteTour/idCliente=:cliente_code')
      .delete(cliente.deleteTour)
  }