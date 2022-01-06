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
  Route.post('reset-email', 'Auth/UserController.SendResetMail')
  Route.post('reset-password', 'Auth/UserController.ResetPassword')

  Route.get('verify-token', 'Auth/TokenController.VerifyToken')
  Route.get('verify-reset-token', 'Auth/TokenController.VerifyResetToken')

}).prefix('api/auth')

Route.group(() => {

  Route.post('post-content', 'Post/PostController.PostContent')

}).prefix('api/post')
