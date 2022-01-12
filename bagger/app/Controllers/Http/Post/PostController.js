'use strict'

const Database = use('Database');
const Generate = use('App/Modules/RandomNumber')
const { validateAll, rule } = use('Validator')

const User = use('App/Models/User')
const Post = use('App/Models/Post')
const Person = use('App/Models/Person')
const HeaderImage = use('App/Models/HeaderImage')

class PostController {

    async PostContent({ request, response }) {
        try {

            const Validation = await validateAll(request.all(), {
                email: 'required|email',
                postContent: 'required|min:5|string',
                postTitle: 'required|min:3|string:',
                categoryId: 'required',
                headerImage: 'required|string'
            })

            if (Validation.fails()) {
                return response.status(400).send({
                    'message': Validation.messages()[0].message + '. (PostController.PostContent)',
                    'status': false
                })
            }

            const { postContent, postTitle, categoryId, email, headerImage } = await request.all()

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
                });

                //headerImage database
                const ImageDB = await HeaderImage.create({
                    'post_id': postID,
                    'header_image': headerImage
                });

                //query user info
                var userInfo = await Person.query().where('person_id', userIsValid.user_id).first();

                return response.status(201).send({
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
                'error': 'PostContent error. ' + error.toString() + '. (PostController.PostContent)'
            })
        }
    }

    async ViewListPost({ request, response }) {
        try {

            const listPost = await Database.from('posts')
                .innerJoin('users', function () {
                    this.on('posts.bagger_id', 'users.user_id')
                })
                .innerJoin('people', function () {
                    this.on('posts.bagger_id', 'people.person_id')
                })
                .innerJoin('categories', function () {
                    this.on('posts.post_category_id', 'categories.category_id')
                })
                .innerJoin('header_images', function() {
                    this.on('posts.post_id', 'header_images.post_id')
                })
                .select('posts.id', 'posts.post_id', 'post_title', 'post_content', 'posts.created_at', 'name', 'username', 'category_name', 'header_image')
                .orderBy('created_at', 'desc')

                if(!listPost) {
                    return response.status(200).send({
                        'status': false,
                        'message': 'Null view list posted content.',
                        'data': ''
                    })
                }

            return response.status(200).send({
                'status': true,
                'message': 'Successfully view list posted contents.',
                'data': {
                    'listPost': listPost
                }
            })


        } catch (error) {
            return response.status(500).send({
                'status': false,
                'message': 'Internal server error',
                'data': 'View list post error. ' + error.toString() + '. (PostController.ViewListPost)'
            })
        }
    }

    async ViewPost({ request, response }) {
        try {

            const validation = await validateAll(request.all(), {
                postId: 'required'
            });

            if (validation.fails()) {
                return response.status(400).send({
                    'status': false,
                    'message': validation.messages(),
                    'data': ''
                })
            }

            const { postId } = await request.all();

            //Query post info
            const postData = await Database.from('posts')
                .innerJoin('users', function () {
                    this.on('posts.bagger_id', 'users.user_id')
                })
                .innerJoin('people', function () {
                    this.on('posts.bagger_id', 'people.person_id')
                })
                .innerJoin('categories', function () {
                    this.on('posts.post_category_id', 'categories.category_id')
                })
                .where('posts.post_id', postId)
                .select('posts.id', 'post_id', 'post_title', 'post_content', 'posts.created_at', 'name', 'username', 'category_name')


            return response.status(200).send({
                'status': true,
                'message': 'Successfully view a post',
                'data': postData
            })

        } catch (error) {

            return response.status(500).send({
                'status': false,
                'message': 'Internal server error',
                'data': 'View post error.' + error.toString() + '. (PostController.ViewPost)'
            })
        }
    }
}

module.exports = PostController
