'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', () => {
  return { greeting: 'Hello world in JSON' }
})

Route.group(() => {

  Route.post('sign-up', 'Auth/UserController.SignUp')

  Route.post('sign-in', 'Auth/UserController.SignIn')

  Route.get('verify-token', 'Auth/TokenController.VerifyToken')

}).prefix('api/auth')
