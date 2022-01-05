'use strict'

const Databse = use('Database');
const { validateAll, rule } = use('Validator')

class PostController {

    async PostContent({ request, response }) {
        try {

            const Validation = await validateAll(request.all(), {
                
                postContent: 'required|min:5|string',
                postTitle: 'required|min:3|string:',
                subcategoryId: 'required'
            })

            if (Validation.fails()) {
                return response.status(400).send({
                    'message': Validation.messages()[0].message + '. (PostController.PostContent)',
                    'status': false
                })
            }

            const { postContent, postTitle, subcategoryId } = await request.all()

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
