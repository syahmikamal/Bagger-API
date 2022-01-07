'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PostSchema extends Schema {
  up () {
    this.create('posts', (table) => {
      table.increments()
      table.string('bagger_id')
      table.string('post_id').notNullable().unique()
      table.string('post_title').nullable()
      table.longText('post_content').nullable()
      table.boolean('post_status').defaultTo(false)
      table.string('post_category_id')
      table.timestamps()
    })
  }

  down () {
    this.drop('posts')
  }
}

module.exports = PostSchema
