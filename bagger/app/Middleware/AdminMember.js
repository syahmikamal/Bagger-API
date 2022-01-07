'use strict'

const appKey = process.env.APP_KEY
const JWT = require('jsonwebtoken');
const User = use('App/Models/User');


/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class AdminMember {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle({ request, response, auth }, next) {
    try {
      // call next to advance the request
      var validSession = await auth.check();

      if (validSession == true) {

        //get JWT token in header from FE
        const header = request.headers();
        const jwtToken = (header.authorization).slice(7);

        //verify JWT token using JWT.io and App key
        const decodedJwtToken = JWT.verify(jwtToken, appKey);

        //get uid from JWT token
        const jwtUserId = decodedJwtToken.data.userId;

        const { uid } = request.all();

        if (uid == null) {
          //Query from table users in DB
          const authUserId = await User.query().where('user_id', jwtUserId).first();

          if (authUserId) {
            if (authUserId.isActive) {
              await next()
            } else {
              return response.status(400).send({
                'status': false,
                'message': 'Activate your account.',
                'detail': 'uid'
              })
            }
          } else {
            return response.status(400).send({
              'status': false,
              'message': 'Invalid JWT token.',
              'detail': 'uid'
            })
          }

        } else {
          return response.status(400).send({
            'status': false,
            'message': 'Invalid user credentials',
            'detail': 'uid is required'
          })
        }

      } else {
        console.log('Invalid JWT token')
        return response.status(400).json({
          'status': false,
          'message': 'Invalid session',
          'detail': 'login'
        })
      }

    } catch (error) {
      return response.status(500).send({
        'message': 'Internal server error',
        'detail': error.toString(),
      })
    }

  }
}

module.exports = AdminMember
