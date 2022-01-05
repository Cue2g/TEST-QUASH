module.exports = function (app){
    const empresa = require('./controllers/empresa.controllers')
    const tour = require('./controllers/tour.controllers')

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
    const urlTours = '/api/tours';
    app.route(urlTours)
      .post(tour.postTour)

    app.route(urlTours)
      .get()

    app.route(urlTours)
      .delete()

    app,route(urlTours)
      .post()

  }