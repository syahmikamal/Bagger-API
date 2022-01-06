'use strict'

const Databse = use('Database');
const Generate = use('App/Modules/RandomNumber')
const { validateAll, rule } = use('Validator')

const User = use('App/Models/User')
const Post = use('App/Models/Post')
const Person = use('App/Models/Person')

class PostController {

    async PostContent({ request, response }) {
        try {

            const Validation = await validateAll(request.all(), {
                email: 'required|email',
                postContent: 'required|min:5|string',
                postTitle: 'required|min:3|string:',
                categoryId: 'required'
            })

            if (Validation.fails()) {
                return response.status(400).send({
                    'message': Validation.messages()[0].message + '. (PostController.PostContent)',
                    'status': false
                })
            }

            const { postContent, postTitle, categoryId, email } = await request.all()

            const postID = await Generate.random('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789', 64);

            //check user validity
            var userIsValid = await User.query().where('email', email).first()

            if (userIsValid) {

                //save in database - post
                const PostDB = await Post.create({
                    'bagger_id': userIsValid.user_id,
                    'post_id': postID,
                    'post_title': postTitle,
                    'post_content': postContent,
                    'post_status': true,
                    'post_category_id': categoryId
                })

                //query user info
                var userInfo = await Person.query().where('person_id', userIsValid.user_id).first();

                return response.status(200).send({
                    'status': true,
                    'message': 'Successfully posted a post',
                    'data': {
                        'post': PostDB,
                        'userData': userInfo
                    }
                })

            } else {
                return response.status(200).send({
                    'status': false,
                    'message': 'Unexisted email'
                })
            }


        } catch (error) {
            return response.status(500).send({
                'status': false,
                'message': 'Internal server error',
                'data': '',
                'error': 'PostContent error. '+error.toString() + '. (PostController.PostContent)'
            })
        }
    }
}

module.exports = PostController
