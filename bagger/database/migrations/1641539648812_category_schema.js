'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CategorySchema extends Schema {
  up () {
    this.create('categories', (table) => {
      table.increments()
      table.integer('category_id').notNullable().unique()
      table.string('category_name')
    })
  }

  down () {
    this.drop('categories')
  }
}

module.exports = CategorySchema
