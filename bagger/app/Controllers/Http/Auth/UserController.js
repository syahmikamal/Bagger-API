'use strict'

const Database = use('Database');
const Generate = use('App/Modules/RandomNumber');
const { validateAll, rule } = use('Validator');
const Hash = use('Hash');
const Mail = use('Mail');
const Env = use('Env')



//Models
const User = use('App/Models/User')
const Person = use('App/Models/Person')


class UserController {

    async SignUp({ request, response }) {
        try {

            const Validation = await validateAll(request.all(), {
                personName: 'required|min:3|max:32',
                username: 'required|min:3|max:15',
                email: 'required|email|max:100',          
                password: [
                    rule('required'),
                    rule('min', 8),
                    rule('max', 18),
                    rule('regex', /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&_])(^\S*$)/)
                ]
            });

            if (Validation.fails()) {
                return response.status(400).json({
                    'message': Validation.messages()[0].message + '. (SignUpController.SignUp)',
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

                    var objectSend = {
                        'url': 'http://127.0.0.1:4200/verify-token/' + verifyToken,
                        'username' : username
                    };

                    //TODO: Send mail as notification for signing up
                    await Mail.send('emails.welcome',objectSend , (message) => {
                        message
                            .to(email)
                            .from(Env.get('DEFAULT_FROM_EMAIL'))
                            .subject('Hello guys')
                    });

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

                    return response.status(201).send({
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
                'status': false,
                'message': 'Internal server error',
                'data' : '',
                'error': 'SignUp error. ' + error.toString() + '. (UserController.SignUp)'
            })
        }
    }

    async SignIn({ request, auth, response }) {
        try {

            const validation = await validateAll(request.all(), {
                email: 'required|email|max:256',
                password: 'required|min:8|max:18'
            });

            if (validation.fails()) {
                return response.status(400).send({
                    'status': false,
                    'message': validation.messages(),
                    'data': ''
                })
            }

            const { email, password } = await request.all()

            //Query user model database
            const user = await User.query().where('email', email).first()

            if (user) {

                //check isActive status
                if (user.isActive == false) {
                    return response.status(200).send({
                        'status': false,
                        'message': 'Unverified user',
                        'data': ''
                    });
                }

                var userId = user.user_id

                //Verify password
                const passwordVerified = await Hash.verify(password, user.password)

                //If success verified
                if (passwordVerified) {

                    //generate jwt token
                    const generateJWT = await auth.withRefreshToken().generate(user, { email, userId });
                    await Object.assign(user, generateJWT);

                    //Query user information
                    const userData = await Person.query().where('person_id', userId).first();

                    return response.status(200).send({
                        'status': true,
                        'message': 'Successfully sign in',
                        'data': {
                            'email'    : email,
                            'userId'   : userId,
                            'name'     : userData.name,
                            'jwtToken' : generateJWT
                        }
                    })
                } else {
                    return response.status(200).json({
                        'status' : false,
                        'message' : 'Invalid user credentials. Password does not match with current password',
                        'data'  : ''
                    });
                }

            } else {
                return response.status(200).json({
                    'status' : false,
                    'message': 'Email does not exist',
                    'data'   : ''
                });
            }

        } catch (error) {

            return response.status(500).send({
                'status' : false,
                'message': 'Internal server error',
                'data'   : 'Sign in error. ' + error.toString() + '. (UserController.SignIn)'
            });
        }
    }

    async SendResetMail({ request, response }) {
        try {

            const validation = await validateAll(request.all(), {
                resetEmail : 'required|email'
            });

            if(validation.fails()) {
                return response.status(400).send({
                    'status' : false,
                    'message' : validation.messages(),
                    'data' : ''
                });

            } else {

                //retrieve input
                const {resetEmail} = await request.all();
                const userData = await User.query().where('email', resetEmail).first();

                console.log('user: ', userData.isActive);

                if(userData.isActive == false) { 
                    return response.status(400).send({
                        'status' : false,
                        'message' : 'Unverified user',
                        'data' : ''
                    });
                }

                //check the existing email
                if(userData) {

                    const resetToken = await Generate.random('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789', 64);

                    await Database.from('users').where({'email': resetEmail}).update({'resetToken':resetToken});

                    const userInfo = await Person.query().where('person_id', userData.user_id).first();

                    //TODO Send email through adonisjs email 

                    return response.status(200).send({
                        'status' : true,
                        'message' : 'Successfully reset password - email sent!',
                        'data' : {
                            'name' : userInfo.name,
                            'resetPassword' : resetToken
                        }
                    });

                } else {

                    return response.status(200).send({
                        'status' : false,
                        'message' : 'User is not existed',
                        'data' : ''
                    });
                }

            }


        } catch (error) {
            return response.status(500).send({
                'status' : false,
                'message' : 'Internal server error',
                'data' : 'Send email reset password error. ' + error.toString() + '. (UserController.SendResetMail)'
            });
        }
    }

   async ResetPassword ({ request, response }) {
       try {

        const messages = {
            'resetToken.required' : 'Reset token is required',

            'newPassword.required'  : 'Password is required',
            'newPassword.min'       : 'Password length must be more than 8 characters',
            'newPassword.max'       : 'Password length must be less than 18 characters',
            'newPassword.regex'     : 'Password must includes at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 special characters (!@#$%^&_) and no whitespace',

            'retypePassword.required'       : 'Retype password is required',
            'retypePassword.min'            : 'Retype password length must be more than 8 characters',
            'retypePassword.max'            : 'Retype password length must be less than 18 characters',
            'retypePassword.regex'          : 'Retype password must includes at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 special characters (!@#$%^&_) and no whitespace.'
        }

        const validation = await validateAll(request.all(), {
            resetToken: 'required',
            newPassword: [
                rule('required'),
                rule('min', 8),
                rule('max', 18),
                rule('regex', /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&_])(^\S*$)/)
            ],
            retypePassword: [
                rule('required'),
                rule('min', 8),
                rule('max', 18),
                rule('regex', /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&_])(^\S*$)/)
            ]
        }, messages);

        if(validation.fails()) { 
            return response.status(400).send({
                'status': false,
                'message': validation.messages(),
                'detail': ''
            });
        } else {

            const { resetToken, newPassword, retypePassword } = await request.all();
            const userData = await User.query().where('resetToken', resetToken).first();

            //Check the existance of reset token
            if(userData) {

                //Check the match between retype passward with new password
                if(newPassword === retypePassword) {

                    const newHashPassword = await Hash.make(newPassword);

                    //update user table
                    await Database.from('users').where({'resetToken': resetToken}).update({'password': newHashPassword});
                    await Database.from('users').where({'resetToken': resetToken}).update({'resetToken': null});

                    return response.status(200).send({
                        'status' : true,
                        'message': 'Success reset password',
                        'data' : '',
                        'error' : ''
                    });

                } else {
                    return response.status(200).send({
                        'status'    : false,
                        'message'   : 'Retype password is not matched',
                        'data'      : '',
                        'error'     :''
                    });
                }

            } else {
                return response.status(200).send({
                    'status' : false,
                    'message' : 'Invalid token credentials.',
                    'data' : '',
                    'error': ''
                });
            }
        }

       } catch (error) {
           return response.status(500).send({
               'status' : false,
               'message' : 'Internal server error',
               'data' : '',
               'error' : 'Reset password error. ' + error.toString() + '. (UserController.ResetPassword)'
           });
       }
   }

}

module.exports = UserController
