'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class HeaderImageSchema extends Schema {
  up () {
    this.create('header_images', (table) => {
      table.increments()
      table.string('header_image')
      table.string('post_id').references('post_id').inTable('posts').onDelete('cascade')
      table.timestamps()
    })
  }

  down () {
    this.drop('header_images')
  }
}

module.exports = HeaderImageSchema
