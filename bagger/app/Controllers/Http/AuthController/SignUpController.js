'use strict'

const Database = use('Database');
const { validateAll, rule } = use('Validator');
const Generate = use('App/Modules/RandomNumber');

//Models
const User = use('App/Models/User')
const Person = use('App/Models/Person')


class SignUpController {

    async SignUp({ request, response }) {
        try {

            const Validation = await validateAll(request.all(), {
                personName: 'required|min:3|max:32',
                email: 'required|email|max:100',
                username: 'required|min:3|max:15',
                password: [
                    rule('required'),
                    rule('min', 8),
                    rule('max', 18),
                    rule('regex', /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&_])(^\S*$)/)
                ]
            });

            if (Validation.fails()) {
                return response.status(400).send({
                    'message': Validation.messages() + '.(SignUpController.SignUp)',
                    'status': false
                });
            }

            const { personName, email, password, username } = await request.all();

            const verifyToken = await Generate.random('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789', 64);

            var userExisted = await User.findBy('email', email);

            if (!userExisted) {

                let buffer = Buffer.from(email);
                var userId = 'TR' + buffer.toString('base64');
                var personExisted = await Person.findBy('username', username);
                
                if (!personExisted) {

                    const UserDB = await User.create({
                        'user_id': userId,
                        'email': email,
                        'password': password,
                        'verifyToken': verifyToken,
                        'resetToken': '',
                        'isActive': false
                    })

                    const PersonDB = await Person.create({
                        'person_id': userId,
                        'name': personName,
                        'username': username,
                        'description': 'Hello world!'
                    })

                    //TODO: Send mail as notification for signing up

                    return response.status(200).send({
                        'status': true,
                        'message': 'Successfully register an account',
                        'data': {
                            'userData': UserDB,
                            'personData': PersonDB
                        }
                    })

                } else {
                    return response.status(200).send({
                        'status': false,
                        'message': 'Username already existed'
                    })
                }

            } else {
                return response.status(200).send({
                    'status': false,
                    'message': 'Email already existed'
                })
            }

        } catch (error) {
            return response.status(500).send({
                'status' : false,
                'message' : 'Internal server error',
                'data' : 'SignUp error. ' + error.toString() + '. (SignUpCOntroller.SignUp)'
            })
        }
    }

}

module.exports = SignUpController
