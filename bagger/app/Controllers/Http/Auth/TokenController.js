'use strict'

const Database = use('Database');
const { validateAll } = use('Validator')

//Models
const User = use('App/Models/User')

class TokenController {

    async VerifyToken({ request, response }) {
        try {

            const Validation = await validateAll(request.all(), {
                verifyToken: 'required'
            })

            if (Validation.fails()) {
                return response.status(400).send({
                    'status': false,
                    'nessage': Validation.messages() + '. (TokenController.VerifyToken)'
                })
            }

            const {verifyToken} = await request.all()
            const VerifyTokenExisted = await User.query('verifyToken', verifyToken).first()

            if (VerifyTokenExisted) {

                await Database.from('users').where({ 'verifyToken': verifyToken })
                    .update({ 'isActive': true })
                await Database.from('users').where({ 'verifyToken': verifyToken })
                    .update({'verifyToken': null})

                return response.status(200).send({
                    'status': true,
                    'message': 'Success to verify token'
                })

            } else {
                return response.status(200).send({
                    'status': false,
                    'message': 'Token is not existed'
                })
            }

        } catch (error) {
            return response.status(500).send({
                'status': false,
                'message': 'Internal server error',
                'data': 'VerifyToken error. ' + error.toString() + '. (TokenController.VerifyToken)'
            })
        }
    }
}

module.exports = TokenController
