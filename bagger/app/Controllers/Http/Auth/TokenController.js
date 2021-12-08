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
                'data' : '',
                'error': 'VerifyToken error. ' + error.toString() + '. (TokenController.VerifyToken)'
            })
        }
    }

    async VerifyResetToken({ request, response }) {
        try {

            const validation = await validateAll(request.all(), {
                resetToken: 'required'
            });

            if(validation.fails()) { 
                return response.status(400).send({
                    'message': validation.messages(),
                    'detail': '', 
                });
            } else {

                //retrieve input
                const { resetToken } = await request.all();
                const resetTokenExisted = await User.query().where('resetToken', resetToken).first();

                //if token not existed
                if(!resetTokenExisted) {
                    return response.status(200).send({
                        'status' : false,
                        'message' : 'Invalid token. Click URL in your email.',
                        'data' : ''
                    });
                } else {
                    return response.status(200).send({
                        'status' : true,
                        'message' : 'Success to verify token.',
                        'data' : ''
                    });
                }
            }

        } catch(error) { 
            return response.status(500).send({
                'status' : false,
                'message' : 'Internal server error',
                'data' : '',
                'error' : 'Verify reset token error. ' + error.toString() + '. (TokenController.VerifyResetToken)'
            });
        }
    }
}

module.exports = TokenController
